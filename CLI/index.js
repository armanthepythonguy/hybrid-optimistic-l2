import inquirer from "inquirer"
import figlet from "figlet"
import { Chalk } from "chalk"
import {generateWallet} from "./wallet.js"

let chalk = new Chalk()

console.log(
    chalk.yellow(
        await generateWallet()
    )
)