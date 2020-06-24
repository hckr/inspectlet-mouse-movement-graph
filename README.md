# Mouse movement graph and csv download for Incpectlet.com

Firefox add-on generating a mouse movement graph for particular segment of inspectlet.com session recording.

Also offers simple CSV data download.

## How to use

1. Clone the repository or download and unpack sources.
2. Open [`about:debugging#/runtime/this-firefox`](about:debugging#/runtime/this-firefox) in Firefox.
3. Load the add-on temporarily, by selecting `manifest.json` in the directory you put these sources.
4. Go to session player in Inspectlet (e.g. `https://www.inspectlet.com/dashboard/watchsession/...`), a new icon should be available on the right: ![](readme-icon.png).
5. Click this icon to download image similar to presented below. There is also another icon for downloading a raw CSV file.

_(Session player should be paused.)_

## Example result

Example mouse movement graph generated from a session on a site created with my team as a student project.

![](example.png)
