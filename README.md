# FLATGAMES
<img width="3818" height="1986" alt="image" src="https://github.com/user-attachments/assets/5e9aaa96-3ee0-4b51-8018-3080a9303243" />

A simple, portable, highly customizable. and essentially unblockable games website.

## HOW TO USE
1. Start the server by navigating to the directory server.js is located.
2. Type "node server.js"
3. Open **http://localhost:3000** in your browser.

## Drop-In Customization

### Add an app

1. Put an `.html` file in the Apps folder.
2. Refresh the homepage.
3. The app appears under **games & apps**.

The server exposes each app at `/apps/<filename>`.

### Add a theme

1. Put a `.css` file in the themes folder. 7 themes are built in.
2. Refresh the homepage.
3. Select it from the theme dropdown.

Theme files are loaded only on the master page. Custom themes can be made by duplicating and editing the default theme.

## Built-In Features

- Folder-based app discovery from `Apps/`
- Folder-based theme discovery from `Themes/`
- Theme selection saved in browser `localStorage`
- Portable local chat built in
- Plain-text message storage in `Data/messages.txt`
- No themes manifest or JSON configuration required
- Works from one self-contained project folder
