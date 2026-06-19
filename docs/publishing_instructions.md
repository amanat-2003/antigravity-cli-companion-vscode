# Publishing the Extension to the VSCode Marketplace

Publishing an extension to the VS Code Marketplace requires a few steps, primarily centered around creating a "Publisher" profile and packaging the extension. Here is the start-to-finish guide to publishing "Antigravity CLI Companion - Unofficial".

## Prerequisites

1. **A Microsoft Account:** You need this to authenticate.
2. **Node.js installed:** You already have this if you are developing the extension.
3. **Install the `vsce` CLI tool:** The Visual Studio Code Extension (VSCE) manager is used to package and publish the code.
   ```bash
   npm install -g @vscode/vsce
   ```

## Step 1: Create a Personal Access Token (PAT)

You need to create a Personal Access Token on Azure DevOps to allow `vsce` to authenticate on your behalf.

1. Go to the [Azure DevOps website](https://dev.azure.com/) and sign in with your Microsoft Account.
2. Create an Organization (if you don't already have one). You don't need to create a project within the organization.
3. In the top right corner of Azure DevOps, click on the **User settings** icon (it looks like a gear or a person next to a gear) and select **Personal access tokens**.
4. Click **New Token**.
5. Fill out the details:
   - **Name:** e.g., "VSCode Marketplace Publishing"
   - **Organization:** Select "All accessible organizations"
   - **Expiration:** Set it to your preference (e.g., 90 days, or up to 1 year).
   - **Scopes:** Select **Custom defined** at the bottom, then click **Show all scopes**.
   - Find the **Marketplace** scope and check **Acquire** and **Manage**.
6. Click **Create**.
7. **Important:** Copy the generated token immediately! You will not be able to see it again. Store it securely.

## Step 2: Create a Publisher

Extensions are published under a "Publisher" profile (currently set as `"amanat-singh"` in your `package.json`).

1. Go to the [Visual Studio Marketplace publisher management page](https://marketplace.visualstudio.com/manage).
2. Sign in with the same Microsoft Account.
3. Click **Create Publisher**.
4. Set the **ID** to exactly what is in your `package.json`'s `publisher` field (e.g., `amanat-singh`, or whatever you want your final publisher name to be — just make sure they match).
5. Fill out the other required details (Name, etc.) and save.

## Step 3: Login via `vsce`

Now that you have a Publisher and a PAT, you need to authenticate your local machine.

Open your terminal and run:
```bash
vsce login <publisher_name>
```
*(Replace `<publisher_name>` with your actual publisher ID, e.g., `vsce login amanat-singh`)*

When prompted, paste the **Personal Access Token** you generated in Step 1.

## Step 4: Final Preparations

Before publishing, ensure your `package.json` is ready:
- The `"version"` should be correct (e.g., `"0.1.0"`).
- The `"repository"` field should point to your public GitHub repository. *(Right now it's a placeholder, you'll want to update this once you push your code!)*
- The `"icon"` is set correctly and the file exists.
- Ensure your `README.md` is polished — this becomes the landing page of your extension on the Marketplace!

## Step 5: Package and Publish

You can package your extension locally first to make sure everything works and to test the `.vsix` file:
```bash
vsce package
```
This generates a file like `antigravity-cli-companion-0.1.0.vsix`. You can drag and drop this file into the VSCode Extensions sidebar to test it locally.

Once you're satisfied and ready to push to the world, run:
```bash
vsce publish
```

`vsce` will run the `vscode:prepublish` script (which compiles your code), package the extension, and upload it directly to the Marketplace.

It usually takes a few minutes for the extension to be processed and become searchable in the marketplace.

## Updating the Extension Later

To publish an update:
1. Make your code changes.
2. Increment the version number in `package.json`. You can use `vsce` for this automatically:
   ```bash
   vsce publish patch  # bumps from 0.1.0 to 0.1.1
   vsce publish minor  # bumps from 0.1.0 to 0.2.0
   vsce publish major  # bumps from 0.1.0 to 1.0.0
   ```
3. This updates the version and publishes all in one step!
