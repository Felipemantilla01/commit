
# @felipemantilla01/commit

## Description

`@felipemantilla01/commit` is a tool that facilitates the generation of commit messages using AI to analyze file changes and generate concise and well-structured commit messages. It is designed for developers who want to improve the quality of their commit messages and streamline the commit process.

![Demo](https://github.com/Felipemantilla01/commit/blob/main/assets/demo.gif)

## Installation

To install the package globally, use the following command:

```bash
npm install -g @felipemantilla01/commit
```

## Usage

### Initial Setup

Before using the tool, you need to perform an initial setup to specify the AI provider and the API token:

```bash
commit --setup
```

This command will start an interactive prompt asking for the following information:

1. **AI Provider**: Currently, only Anthropic is supported.
2. **API Token**: Enter your API token for the selected AI provider.

The configuration will be saved in a file named `commit-config.json` in the current directory.

### Generate Commit Messages

To generate a commit message based on the staged files and the current diff, simply run:

```bash
commit
```

The command will perform the following actions:

1. Read the staged files and get the diff.
2. Read the content of the staged files.
3. Generate a commit message using AI.
4. Display the generated commit message and ask for confirmation before committing.

### Sign Commits with GPG

If you want to sign your commits with GPG, you can use the `-S` or `--gpg-sign` option:

```bash
commit -S
```

## Command Line Options

- `--setup`: Run the initial setup to specify the AI provider and API token.
- `-S`, `--gpg-sign`: Sign commits with GPG.

## Example

1. Run the initial setup:

   ```bash
   commit --setup
   ```

2. Generate a commit message and commit:

   ```bash
   commit
   ```

3. Generate a commit message and sign the commit with GPG:

   ```bash
   commit -S
   ```

## Contributing

Contributions are welcome. If you find an issue or have a suggestion, please open an issue in the GitHub repository.

## License

This project is licensed under the MIT License.

---

Thank you for using `@felipemantilla01/commit`!
