// reqs
const fs = require('fs')
const sleep = require('system-sleep')
const { Client, DMChannel, RichEmbed } = require('discord.js')
const { google } = require('googleapis')

// google api
const TOKEN_PATH = 'gapi_token.json'
// discord
const token = fs.readFileSync('token').toString()
const client = new Client()

// constants
const NUM_EMOJIS = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:']
const VOTE_OPTIONS = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':zero:']
const VOTE_EMOJIS = ['\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3',  '\u0036\u20E3', '\u0037\u20E3', '\u0038\u20E3', '\u0039\u20E3', '\u0030\u20E3']
const LIGHT_BLUE = 0xADD8E6
const RED = 0xFF0000

const GUILD_ID = '433080296057864192'
const ADMIN_ID = '313850299838365698'

// converts a number into emojis that represent it
function num_to_emoji(num) {
    let str = ''
    while (num >= 1) {
        str = NUM_EMOJIS[num % 10] + str
        num = Math.floor(num / 10)
    }
    return str
}

function introduce_server(user) {
    const msg = 'This is the Discord server for the Game Design and Development club at Berkeley. '
        + 'If you\'re interested in making games, this is the place for you. We look forward to working with you :smile:\n\n'
        + 'Please read #welcome-and-rules and #apply-for-role.'

    const embed = new RichEmbed()
        .setTitle(':game_die: Welcome to GDD!')
        .setColor(LIGHT_BLUE)
        .setDescription(msg)
    user.send(embed)
}

function can_only_be_used_in_guild(channel) {
    const embed = new RichEmbed()
        .setTitle(':exclamation: Command error:')
        .setColor(RED)
        .setDescription('Sorry, that command can only be used in the GDD server')
    channel.send(embed)
}

// returns a role, returning null if not found
function parse_role(message, args) {
    const args_str = args.join(' ')
    if (args_str.match(/^league(?:\s?of\s?legends?)?|lol$/i)) {
        return message.guild.roles.find("name", "League of Legends")
    } else if (args_str.match(/^overwatch|ow$/i)) {
        return message.guild.roles.find("name", "Overwatch")
    } else if (args_str.match(/^gwent$/i)) {
        return message.guild.roles.find("name", "Gwent")
    }
    return null
}

// notifies the channel
function role_not_found(channel) {
    const embed = new RichEmbed()
        .setTitle(':exclamation: Role error:')
        .setColor(RED)
        .setDescription('That role couldn\'t be found')
    channel.send(embed)
}

function add_role(message, args) {
    if (!message.guild || message.guild.id !== GUILD_ID) {
        can_only_be_used_in_guild(message.channel)
        return
    }
    const role = parse_role(message, args)
    if (!role) {
        role_not_found(message.channel)
        return
    }
    if (message.member.roles.has(role.id)) {
        const embed = new RichEmbed()
            .setTitle(':exclamation: Role error:')
            .setColor(RED)
            .setDescription('You already have that role')
        message.channel.send(embed)
        return
    }
    message.member.addRole(role)
    const embed = new RichEmbed()
        .setTitle(':white_check_mark: Role added')
        .setColor(LIGHT_BLUE)
    message.channel.send(embed)
}

function remove_role(message, args) {
    if (!message.guild || message.guild.id !== GUILD_ID) {
        can_only_be_used_in_guild(message.channel)
        return
    }
    const role = parse_role(message, args)
    if (!role) {
        role_not_found(message.channel)
        return
    }
    if (!message.member.roles.has(role.id)) {
        const embed = new RichEmbed()
            .setTitle(':exclamation: Role error:')
            .setColor(RED)
            .setDescription('You don\'t have that role')
        message.channel.send(embed)
        return
    }
    message.member.removeRole(role)
    const embed = new RichEmbed()
        .setTitle(':white_check_mark: Role removed')
        .setColor(LIGHT_BLUE)
    message.channel.send(embed)
}

function help_role(message) {
    const embed = new RichEmbed()
        .setTitle(':question: /role usage:')
        .setColor(LIGHT_BLUE)
        .setDescription('**Adding a role**\n/role add <name of game>\n/addrole <name>\n**Removing a role**\n/role remove <name>\n/removerole <name>')
    message.channel.send(embed)
}

client.on('guildMemberAdd', member => {
    if (!member.bot) {
        introduce_server(member)
    }
})

client.on('message', message => {
    if (message.author.bot) {
        return
    }

    const args = message.content.match(/(?:[^\s"]+|"[^"]*")+/gi)
    if (args.length < 1) {
        return
    }

    if (message.content.startsWith('/') || message.channel instanceof DMChannel) {
        console.log('(' + (new Date(message.createdTimestamp)).toLocaleString('en-US') + ') '
            + '[' + message.author.tag + ' in ' + (message.channel.name ? message.channel.name : 'PM') + '] '
            + message.content)
    }
    if (args[0] === '/poll') {
        if (args.length == 1) {
            const embed = new RichEmbed()
                .setTitle(':bar_chart: Poll usage:')
                .setColor(LIGHT_BLUE)
                .setDescription('**Yes / No**\n/poll "Boba?"\n**Multi answer (up to 10)**\n/poll "Where?" "UCha" "Asha"')
            message.channel.send(embed)
        } else if (args.length > 12) {
            const embed = new RichEmbed()
                .setTitle(':exclamation: Poll command error:')
                .setColor(RED)
                .setDescription('Too many answers - max 10')
            message.channel.send(embed)
        } else if (args.length == 2) {
            const query = args[1]
            const embed = new RichEmbed()
                .setTitle(':bar_chart: ' + query)
                .setColor(LIGHT_BLUE)
                .setDescription(':white_check_mark: Yes\n:negative_squared_cross_mark: No')
            message.channel.send(embed).then(message => {
                message.react('✅')
                sleep(500)
                message.react('❎')
            })
        } else {
            const query = args[1]
            const options = args.slice(2)
            let options_str = ''
            let i = 0
            for (let option of options) {
                options_str += VOTE_OPTIONS[i] + ' ' + option + '\n'
                i += 1
            }

            const embed = new RichEmbed()
                .setTitle(':bar_chart: ' + query)
                .setColor(LIGHT_BLUE)
                .setDescription(options_str)
            message.channel.send(embed).then(message => {
                const emojis = VOTE_EMOJIS.slice(0, options.length)
                for (let emoji of emojis) {
                    message.react(emoji)
                    sleep(500)
                }
            })
        }
    } else if (args[0] === '/dice' || args[0] === '/roll') {
        if (args.length > 2) {
            const embed = new RichEmbed()
                .setTitle(':game_die: Dice usage:')
                .setColor(LIGHT_BLUE)
                .setDescription('**Roll a 6 sided dice**\n/dice\n**Roll a dice with any number of faces**\n/dice 20\n**Roll a number of dice**\n/dice 4d6')
            message.channel.send(embed)
        } else {
            let dice = 1
            let d = false
            let faces = 6
            if (args.length == 2) {
                let matches = args[1].match(/^(?:([1-9]\d*)?(d))?([1-9]\d*)$/i)
                // could handle dice/face number overload in regex, but we want targeted error messages
                if (matches) {
                    matches = matches.slice(1)
                    if (matches[0]) {
                        dice = parseInt(matches[0])
                    }
                    if (matches[1]) {
                        d = true
                    }
                    faces = parseInt(matches[2])
                } else {
                    const embed = new RichEmbed()
                        .setTitle(':exclamation: Dice command error:')
                        .setColor(RED)
                        .setDescription('Please enter a valid number of faces and dice')
                    message.channel.send(embed)
                    return
                }

                if (dice > 100) {
                    const embed = new RichEmbed()
                        .setTitle(':exclamation: Dice command error:')
                        .setColor(RED)
                        .setDescription('Please use fewer than 100 dice')
                    message.channel.send(embed)
                    return
                }
                if (faces >= 1e18) {
                    const embed = new RichEmbed()
                        .setTitle(':exclamation: Dice command error:')
                        .setColor(RED)
                        .setDescription('Please use fewer than 1 quintillion faces')
                    message.channel.send(embed)
                    return
                }
            }
            let sum = 0
            let results = []
            for (let i = 0; i < dice; i += 1) {
                let result = Math.ceil(Math.random() * faces)
                sum += result
                if (d && (result == 1 || result == faces)) {
                    result = num_to_emoji(result)
                }
                results.push(result)
            }
            const embed = new RichEmbed()
                .setTitle(':game_die: Rolling '
                    + ((dice == 1) ? 'a' : dice) + ' '
                    + faces + '-sided dice:')
                .setColor(LIGHT_BLUE)
                .setDescription(results.join('+') + ((dice == 1) ? '' : (' = ' + sum)))
            message.channel.send(embed)
        }
    } else if (args[0] === '/help' || args[0] === '/commands') {
        const embed = new RichEmbed()
            .setTitle(':question: GDDBot Commands:')
            .setColor(LIGHT_BLUE)
            .setDescription('**Roll a dice:** /dice\n'
                + '**Poll the channel:** /poll\n'
                + '**Lab Checkoffs** (decal only): /lab\n')
            .setFooter('Made by Logikable#6019 for GDD :)')
        message.channel.send(embed)
    } else if (args[0] === '/checkoff' || args[0] === '/lab') {
        // if (!sheets) {
        //     const embed = new RichEmbed()
        //         .setTitle(':exclamation: Checkoff error:')
        //         .setColor(RED)
        //         .setDescription('Please notify Logikable#6019...')
        //     message.author.send(embed)
        //     return
        // }
        // initialize google api oAuth2 client
        fs.readFile('gapi_credentials.json', (err, content) => {
            const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
            fs.readFile(TOKEN_PATH, (err, token) => {
                oAuth2Client.setCredentials(JSON.parse(token))
                const sheets = google.sheets({ version: 'v4', auth: oAuth2Client })
                sheets.spreadsheets.values.get({
                    spreadsheetId: '1O4KiEgQ82M8jNRJBbDZgC-bIXC_yiCx5Qzh6EC4JGkk',
                    range: 'Sheet1!A:Z',
                }, (err, res) => {
                    if (err) return console.log('API Error: ' + err)
                    const rows = res.data.values
                    const headers = rows[0]
                    const tag = message.author.tag

                    for (let row of rows.slice(1)) {
                        if (row[0] && tag.toLowerCase() === row[0].toLowerCase()) {   // found their username!
                            let incomplete = []
                            let complete = []
                            for (let index = 2; index < headers.length; index += 1) {
                                if (index < row.length && row[index]) {
                                    complete.push(headers[index])
                                } else {
                                    incomplete.push(headers[index])
                                }
                            }
                            const embed = new RichEmbed()
                                .setTitle(':white_check_mark: Lab checkoff list:')
                                .setColor(LIGHT_BLUE)
                                .setDescription(((incomplete.length == 0) ?
                                        '**Congrats! You\'re all caught up.**' :
                                        '**Incomplete labs: ' + incomplete.join(', ') + '**')
                                    + '\n'
                                    + 'Completed labs: ' + complete.join(', '))
                                .setFooter('Please notify a facilitator if something is wrong!')
                            message.author.send(embed)
                            return
                        }
                    }
                    // never found their username
                    const embed = new RichEmbed()
                        .setTitle(':exclamation: Checkoff error:')
                        .setColor(RED)
                        .setDescription('This command is for people currently in the decal. '
                            + 'If you\'re in the decal but this message is showing, let a facilitator know.')
                    message.author.send(embed)
                })
            })
        })
    } else if (args[0] === '/intro') {
        introduce_server(message.author)
    } else if (message.content.match(/^(?:\S+\s+)*(wes|wesley)[,.]?(?:\s+(?:\S+\s+)*)?$/i)
            && ['433105512675016716', '433105674675814430', '433105785468485662', '488062770194153473', '455609253617729546'].includes(message.channel.id)) {
        const wes_list = ['welsey', 'weesley', 'weasley', 'weaslely', 'weasel-y', 'weselely']
        const random_wes = wes_list[Math.floor(Math.random() * wes_list.length)]
        message.channel.send(':bear: Did you mean: *' + random_wes + '*? :bear:')
    } else if (args[0] === '/addrole') {
        if (args.length === 1) {
            help_role(message)
        } else {
            add_role(message, args.slice(1))
        }
    } else if (args[0] === '/removerole' || args[0] === '/deleterole') {
        if (args.length === 1) {
            help_role(message)
        } else {
            remove_role(message, args.slice(1))
        }
    } else if (args[0] === '/role') {
        if (args.length >= 3 && args[1] === 'add') {
            add_role(message, args.slice(2))
        } else if (args.length >= 3 && (args[1] === 'remove' || args[1] === 'delete')) {
            remove_role(message, args.slice(2))
        } else {
            help_role(message)
        }
    }
})

client.on('ready', () => {
    client.user.setPresence({ game: { name: '/help to get started!'}})
    console.log('Ready.')
})

client.login(token)
