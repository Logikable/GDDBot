# GDDBot

#### To join the Game Design & Development Discord, follow [this link!](https://discord.gg/yaFYJxc) All game design enthusiasts are welcome!

### Purpose

This multi-purpose bot functions as a fun + useful bot, encouraging active use of our server. Our goal is to provide anything and everything that the community may need.

## Documentation

If you're here to learn how to contribute to GDDBot; please see [Contributing](#contributing).

### Introduction

GDDBot is developed in Javascript, using the [discord.js](https://discord.js.org/) library on Node.js. A handful of other packages are used, including [googleapis](https://www.npmjs.com/package/googleapis) for interacting with Google Docs. 

At its core, the code is split from top to bottom into multiple sections: constants, utility functions, /help functions, auxilliary functions, and client triggers. It's not very useful to explain what each section is for, since most commands require changes to every section. Thus, this bot's documentation is best organized at a higher level: by command.

First however, let's cover common patterns used.

### Patterns

#### Discord Functionality

By nature, Discord bots are eventful; that is, they respond when prompted by users on Discord. Most people reply with a message to the channel the prompt was received from; I like to use RichEmbeds for a more professional feel. You've probably seen RichEmbeds before, they look like this:

![](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LAEeOAJ8-CJPfZkGKqI%2F-LAEmDGzvjK634rgf6_q%2F-LAEmPBF47FJgnfBD21P%2Fembedexample2.png?generation=1523904523586976&alt=media)

You can control the title, image, content, sections, footer, and even the colour of the highlight to the left. GDDBot uses two main colours: `LIGHT_BLUE` for affirmative/informative messages, and `RED` for errors. These constants are defined in the code.

#### Command Pattern

Almost all commands follow one programming pattern: command string matching, error handling, then the actual function body. This keeps for a consistently readable format. Of course, sometimes errors cannot be detected until the end of the function body, so this pattern is not rigid.

There is also a flow that users expect when running commands. I rarely put functionality in the parameterless command (i.e. just `/poll`), since many users run a command for the first time to learn its functionality. This should display a help menu, which users can then craft their intended command from. So far, the main exception to this rule is for aliases (e.g. `/addrole` instead of `/role add`), since the functionality is baked into the name.

The command parsing logic is hierarchical. This means that the first argument is parsed first, then the rest of the command is processed by the appropriate section of the code.

In addition, the help menu for any command is displayed in two ways: the parameterless command, and `/help <name>`. As such, the 

### Commands

#### /poll



### Contributing
