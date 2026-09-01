function installHistoryHooks(onNavigation: () => void): void {
  // Handle popstate, hashchange, pageshow events
  window.addEventListener('popstate', onNavigation)
  window.addEventListener('hashchange', onNavigation)
  window.addEventListener('pageshow', onNavigation)

  // Patch history.pushState
  const originalPushState =
    history.pushState

  history.pushState =
    function pushState(
      ...args: Parameters<
        History['pushState']
      >
    ): void {
      originalPushState.apply(
        history,
        args,
      )

      onNavigation()
    }

  // Patch history.replaceState
  const originalReplaceState =
    history.replaceState

  history.replaceState =
    function replaceState(
      ...args: Parameters<
        History['replaceState']
      >
    ): void {
      originalReplaceState.apply(
        history,
        args,
      )

      onNavigation()
    }
}

export { installHistoryHooks }