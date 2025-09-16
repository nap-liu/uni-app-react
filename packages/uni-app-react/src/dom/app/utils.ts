export const getPageContainer = () => {
  const pages = getCurrentPages()
  // @ts-ignore
  return pages[pages.length - 1].__page_container__
}
