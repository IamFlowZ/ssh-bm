import { parse, exec } from './deps.ts';

import { BookMark, BookMarkCollection } from "./bookmarks.ts";

const readPerms = { name: "read", path: "./bookmarks.json" } as const;
const writePerms = { name: "write", path: "./bookmarks.json" } as const;
const sshPerms = { name: "ssh", path: "ssh" } as const;

const rawArgs = parse(Deno.args);
const cmdArgs = rawArgs["_"];

class App {
  public bookmarks: BookMarkCollection;
  static managementVerbs = ["put", "wipe", "find", "flush", "list"];

  constructor(
    public rawArgs: { [k: string]: string | number },
    public cmdArgs: (string | number)[],
  ) {
    this.bookmarks = new BookMarkCollection();
  }

  async main() {
    const mainCmd = this.cmdArgs[0] as string;
    const askedForHelp = this.rawArgs["help"];
    const debug = this.rawArgs["debug"];
    if (debug) {
      console.log(this.bookmarks, this.rawArgs, this.cmdArgs);
    }
    try {
      if (askedForHelp) {
        this.help();
        Deno.exit(0);
      }

      if (App.managementVerbs.includes(mainCmd)) {
        this.cmdArgs.shift();
        // @ts-ignore
        const returnCode = await this[mainCmd](...this.cmdArgs);
        Deno.exit(returnCode);
      }

      if (debug) {
        console.log(`connecting to: ${mainCmd}`);
      }
      await this.ssh(mainCmd);
    } catch (err) {
      console.error("failed", err);
      Deno.exit(1);
    }
  }

  async ssh(name: string) {
    const bookmark = this.bookmarks.find(name);
    await exec(`ssh ${bookmark?.connectionString}`);
  }

  async put(name: string, connStr: string) {
    const returnCode = await this.bookmarks.put(new BookMark(connStr, name));
    Deno.exit(returnCode);
  }

  async wipe(name: string) {
    const returnCode = await this.bookmarks.delete(name);
    Deno.exit(returnCode);
  }

  async find(name: string) {
    const bookmark = await this.bookmarks.find(name);
    if (bookmark) {
      console.log(`Found: ${JSON.stringify(bookmark)}`);
    } else {
      console.log(`Did not find ${name}`);
    }
    Deno.exit(0);
  }

  async list() {
    console.table((this.bookmarks.bookmarks));
  }

  help() {
    console.log(`
ssh-bm cms -> ssh into cms
ssh-bm put cms user@23.12.12.12 -> adds/updates bookmark named cms
ssh-bm wipe cms -> removes cms
ssh-bm find cms -> prints bookmark to terminal
ssh-bm list -> lists all available bookmarks
ssh-bm X --help -> print help statement
ssh-bm flush -> resets collection after confirmation`);
  }

  async flush() {
    await this.bookmarks.reset();
    Deno.exit(1);
  }
}

// console.log(readBms);

const app = new App(rawArgs, cmdArgs);
await app.main();
