import { transformAsync } from '@babel/core'
import jsxPlugin from '@babel/plugin-transform-react-jsx'
import presetTypescript from '@babel/preset-typescript'
import * as t from '@babel/types'
import {
  internalComponents,
  mergeInternalComponents,
  toDashed,
  toKebabCase,
} from './template'
import type { Plugin } from 'vite'
import { getPlatformTemplate } from './template'

const packageName = '@js-css/uni-app-react'
export function UniAppReact(): Plugin {
  const platform = process.env.UNI_PLATFORM
  const rootDir = process.env.VITE_ROOT_DIR
  const isMP = /mp/i.test(platform)
  const isH5 = /h5/i.test(platform)
  const isApp = /app/i.test(platform)
  const isDingtalk = /dingtalk/i.test(process.env.UNI_UTS_PLATFORM)

  // console.log('platform', platform)

  const platformTemplate = getPlatformTemplate(platform) || ({} as any)

  const VIRTUAL_PREFIX = '\0vite-uni-app-react:'

  const mergedInternalComponents = mergeInternalComponents(
    platformTemplate?.components || {}
  )

  const internalComponentsMap = Object.keys(internalComponents).reduce(
    (map, key) => {
      map[toKebabCase(key)] = true
      return map
    },
    {}
  )

  const includes = new Set<string>()
  const exclude = new Set<string>(['script'])
  const thirdPartyComponents = new Map<string, Set<string>>()
  function addThirdPartyComponent(comp: string) {
    if (thirdPartyComponents.has(comp)) {
      return
    }
    thirdPartyComponents.set(comp, new Set())
  }

  function addThirdPartyComponentProps(comp: string, prop: string) {
    if (!thirdPartyComponents.has(comp)) {
      thirdPartyComponents.set(comp, new Set())
    }
    thirdPartyComponents.get(comp).add(prop)
  }

  function getTagName(
    node:
      | t.JSXIdentifier
      | t.JSXMemberExpression
      | t.JSXNamespacedName
      | t.JSXFragment
      | t.JSXExpressionContainer
  ): string | null {
    if (t.isJSXIdentifier(node)) return node.name
    if (t.isJSXMemberExpression(node)) {
      const objectName = getTagName(node.object)
      if (!objectName) return null
      return objectName + '.' + node.property.name
    }
    if (t.isJSXNamespacedName(node))
      return `${node.namespace.name}:${node.name.name}`
    return null
  }

  function collectNativeElementPlugin() {
    const h5ImportBuildInComponentStyle = {
      ImportDeclaration(path, state) {
        const source = path.node.source.value
        if (source === packageName) {
          path.node.specifiers.forEach((specifier) => {
            if (t.isImportSpecifier(specifier)) {
              state.importedComponents.add(
                t.isIdentifier(specifier.imported)
                  ? specifier.imported.name
                  : specifier.imported.value
              )
            }
          })
        }
      },

      Program: {
        enter(path, state) {
          state.importedComponents = new Set<string>()
        },
        exit(path, state) {
          const tryImportStyle = (importPath: string) => {
            try {
              const resolvePath = require.resolve(importPath, {
                paths: [rootDir],
              })
              // console.log('auto import css', importPath)
              // console.log('auto resolvePath css', resolvePath)
              const importDeclaration = t.importDeclaration(
                [],
                t.stringLiteral(resolvePath)
              )
              path.unshiftContainer('body', importDeclaration)
            } catch (e) {
              // 忽略不存在的组件
              // console.log(`${importPath} not exists`)
              return
            }
          }

          state.importedComponents.forEach((comp: string) => {
            const dashedName = toDashed(comp)

            const packages = [
              (name) => `@dcloudio/uni-components/style/${name}.css`,
              (name) => `@dcloudio/uni-h5/style/${name}.css`,
            ]

            packages.forEach((getImportPath) => {
              tryImportStyle(getImportPath(dashedName))
            })
          })
        },
      },
    }

    return {
      visitor: {
        JSXOpeningElement(path: any) {
          const tagName = getTagName(path.node.name)
          if (!tagName) return
          if (tagName in internalComponentsMap) {
            return
          }

          if (/^[a-z]/.test(tagName)) {
            const idx = path.node.attributes.findIndex(
              (attr) =>
                t.isJSXAttribute(attr) &&
                t.isJSXIdentifier(attr.name) &&
                attr.name.name === 'useHostElement'
            )

            if (idx === -1) {
              path.node.name.name = 'ReactVueProxy'
              path.node.attributes.push(
                t.jsxAttribute(
                  //
                  t.jsxIdentifier('$_cn_'),
                  t.stringLiteral(tagName)
                )
              )
            } else {
              // 移除掉 useHostElement 属性
              path.node.attributes.splice(idx, 1)

              addThirdPartyComponent(tagName)
              // console.log('tagName', tagName, thirdPartyComponents)
              path.node.attributes.forEach((attr: any) => {
                if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                  const attrName = attr.name.name
                  if (attrName === 'ref' || attrName === 'key') {
                    return
                  }
                  addThirdPartyComponentProps(tagName, attr.name.name)
                }
              })
            }
          }
        },
        ...(isH5 ? h5ImportBuildInComponentStyle : {}),
      },
    }
  }

  const componentAliasPath = new RegExp(
    'uni-app-react/src/dom/mp/alias.ts$',
    'i'
  )
  const ___MP_DOM_COMPONENT_ALIAS____ =
    '"___MP_DOM_COMPONENT_ALIAS_PLACEHOLDER____"'

  let Template
  let tmpExts
  let tmpGen
  let components = []

  if (isMP) {
    Template = platformTemplate.Template
    tmpExts = platformTemplate.fileExt
    tmpGen = new Template()
    components = ['document']

    tmpGen.isLegacySlot = isDingtalk

    if (!tmpGen.isSupportRecursive) {
      components.push('comp')
    }

    tmpGen.internalComponents = mergedInternalComponents
    tmpGen.baseLevel = 20
  }

  return {
    name: 'vite:uni-app-react',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      if (isApp) {
        return
      }

      if (!resolvedConfig.build.rollupOptions.output)
        resolvedConfig.build.rollupOptions.output = {}

      type OnlyObject<T> = T extends any[] ? never : T
      type OnlyFun<T> = T extends Function ? T : never

      type RollupOutput =
        (typeof resolvedConfig)['build']['rollupOptions']['output']

      type SingleOutputOptions = OnlyObject<RollupOutput>
      type ManualChunks = SingleOutputOptions['manualChunks']
      type GetManualChunk = OnlyFun<ManualChunks>

      const output = resolvedConfig.build.rollupOptions.output

      const chunkTest = new RegExp(`(${components.join('|')})\\.[jt]s$`)

      if (Array.isArray(output)) {
        output.forEach((item) => {
          const manualChunks = item.manualChunks as GetManualChunk
          item.manualChunks = (id, chunk) => {
            if (chunkTest.test(id)) {
              return undefined
            } else {
              return manualChunks?.(id, chunk)
            }
          }
        })
      } else {
        const manualChunks = output.manualChunks as GetManualChunk
        output.manualChunks = (id, chunk) => {
          if (chunkTest.test(id)) {
            return undefined
          } else {
            return manualChunks?.(id, chunk)
          }
        }
      }
    },

    buildStart() {
      if (isMP) {
        components.forEach((id) => {
          this.emitFile({
            type: 'chunk',
            id: VIRTUAL_PREFIX + id,
            fileName: `${id}.js`,
          })
        })
      }
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        // console.log('vite-uni-appre-jsx: resolveId', id)
        return id
      }
      if (componentAliasPath.test(id)) {
        // console.log('vite-uni-appre-jsx: resolveId componentAliasPath', id)
        return id
      }
    },

    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        // console.log('vite-uni-appre-jsx: load', id)
        const realName = id.slice(VIRTUAL_PREFIX.length)
        return `export * from '${packageName}/src/mp/${realName}'`
      }
      if (componentAliasPath.test(id)) {
        // console.log('vite-uni-appre-jsx: load componentAliasPath', id)
        return `export const componentAlias = ${___MP_DOM_COMPONENT_ALIAS____}`
      }
    },

    async transform(code, id) {
      if (isMP || isApp) {
        if (/preact/.test(id) && /\.[jt]s$/.test(id)) {
          const mpDocument = `import { runtimeDocument as document } from '${packageName}';\n`
          return {
            code: mpDocument + code,
          }
        }
      }
      if (!/\.[jt]sx$/.test(id)) return
      const injectHImport = `import { createElement as h, Fragment as f } from 'react'; import { ReactVueProxy } from '${packageName}'\n`
      const result = await transformAsync(code, {
        filename: id,
        presets: [presetTypescript],
        plugins: [
          collectNativeElementPlugin,
          [
            jsxPlugin,
            {
              runtime: 'classic',
              pragma: 'h',
              pragmaFrag: 'f',
              throwIfNamespace: false,
              useBuiltIns: false,
            },
          ],
        ],
        sourceMaps: true,
      })

      return {
        code: injectHImport + (result?.code || code),
        map: result?.map || null,
      }
    },

    buildEnd() {
      if (isMP) {
        components.forEach((id) => {
          this.emitFile({
            type: 'asset',
            source: JSON.stringify({
              component: true,
              styleIsolation: 'apply-shared',
              ...(tmpGen.isSupportRecursive
                ? {}
                : {
                    usingComponents: {
                      comp: './comp',
                    },
                  }),
            }),
            fileName: `${id}.json`,
          })
        })

        const componentConfig: Parameters<typeof tmpGen.buildTemplate>[0] = {
          exclude,
          includes,
          includeAll: true,
          thirdPartyComponents,
        }

        // thirdPartyComponents.clear()
        // addThirdPartyComponent('v')
        // console.log('componentConfig', componentConfig)

        if (!tmpGen.isSupportRecursive) {
          this.emitFile({
            type: 'asset',
            fileName: `base${tmpExts.xml}`,
            source: tmpGen.buildTemplate(componentConfig),
          })
          this.emitFile({
            type: 'asset',
            fileName: `comp${tmpExts.xml}`,
            source: tmpGen.buildBaseComponentTemplate(tmpExts.xml),
          })
          this.emitFile({
            type: 'asset',
            fileName: `document${tmpExts.xml}`,
            source: `${tmpGen.buildPageTemplate(`./base${tmpExts.xml}`)}`,
          })
        } else {
          this.emitFile({
            type: 'asset',
            fileName: `document${tmpExts.xml}`,
            source: `${tmpGen.buildPageTemplate(`./base${tmpExts.xml}`)}\n${tmpGen.buildTemplate(componentConfig)}`,
          })
        }

        this.emitFile({
          type: 'asset',
          fileName: `utils${tmpExts.xs}`,
          source: tmpGen.buildXScript(),
        })
        // console.log('componentsAlias', JSON.stringify(tmpGen.componentsAlias))
      }
    },

    renderChunk(code) {
      if (code.includes(___MP_DOM_COMPONENT_ALIAS____)) {
        // console.log(
        //   '___MP_DOM_COMPONENT_ALIAS____',
        //   JSON.stringify(tmpGen.componentsAlias)
        // )
        return code.replace(
          ___MP_DOM_COMPONENT_ALIAS____,
          JSON.stringify(tmpGen.componentsAlias, null, 2)
        )
      }
    },
  }
}
