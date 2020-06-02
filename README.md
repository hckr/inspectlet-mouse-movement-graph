# inspectlet-mouse-movement-graph

Firefox add-on generating a mouse movement graph for particular segment of inspectlet.com session recording

## How to use

1. Clone the repository or download and unpack sources.
2. Open [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) in Firefox.
3. Load the add-on temporarily, by selecting `manifest.json` in the directory you put these sources.
4. Go to session player in Inspectlet (e.g. `https://www.inspectlet.com/dashboard/watchsession/...`), a new icpmn should be available on the right: ![](readme-icon.png).
5. A website screenshot with an overlaid graph should be opened in new tab (allow opening windows if such a yellow bar appears) – use right-click to save image.
