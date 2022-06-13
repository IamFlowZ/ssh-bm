import { parse } from "https://deno.land/std@0.143.0/flags/mod.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";

const readPerms = { name: "read", path: "./bookmarks.json" } as const;
const writePerms = { name: "write", path: "./bookmarks.json" } as const;
const sshPerms = { name: "ssh", path: "ssh" } as const;

const rawArgs = parse(Deno.args);
const cmdArgs = rawArgs['_'];
// console.log(cmdArgs);

class BookMark {
  constructor(
    public connectionString: string,
    public name: string,
    public idFilePath?: string,
  ) {

  }

  validate(){}
}

class BookMarkCollection {
  public bookmarks: {[k: string]: BookMark}
  constructor() {
    this.bookmarks = this.load();
  }

  put(bookmark: BookMark) {
    this.bookmarks[bookmark.name] = bookmark;
    try {
      this.save();
    } catch(err) {
      console.error(`Could not add ${bookmark.name}. ${err}`);
      return 1;
    }
    console.log(`Added ${bookmark.name}!`);
    return 0
  }

  delete(name: string){
    try {
      delete this.bookmarks[name];
      this.save();
    } catch (err) {
      console.error(`Could not remove ${name}, ${err}`);
      return 1;
    }
    console.log(`Removed ${name}`);
    return 0;
  }

  /**
   * Prioritizes finding by name over connection string.
   * Bails out if searching by conn str and multiple are found.
   * returns null if 
   * @param name {string} name of the bookmark
   * @param connectionString {string} the connection string used
   * @returns a bookmark instance or null if none found
   */
  find(name?: string, connectionString?: string) {
    if (name) {
      return this.findByName(name);
    }

    if (connectionString) {
      const finds = this.findByConnStr(connectionString);
      if (finds.length > 1) {
        console.log(`Multiple instances found when looking for ${connectionString}`);
        console.log(`See: ${finds.map((find) => find.name)}`);
        Deno.exit(1);
      }
      return finds[0];
    }

    return null;
  }

  private findByName(name: string) {
    try {
      return this.bookmarks[name];
    } catch (err) {
      // accessing undefined throws error
      return null;
    }
  }

  private findByConnStr(connStr: string){
    return Object.values(this.bookmarks).filter(
      (bookmark: BookMark) => bookmark.connectionString === connStr
    );
  }

  private async save() {
    await Deno.writeTextFile("./bookmarks.json", JSON.stringify(this.bookmarks));
  }

  private load() {
    const readBms = Deno.readTextFileSync('./bookmarks.json');
    return JSON.parse(readBms);
  }

  async reset() {
    await Deno.writeTextFile("./bookmarks.json", JSON.stringify({}));
  }
}

class App {
  public bookmarks: BookMarkCollection;
  static managementVerbs = ['put', 'delete', 'find', 'reset'];

  constructor(
    public rawArgs: {[k: string]: any},
    public cmdArgs: (string | number)[]
  ) {
    this.bookmarks = new BookMarkCollection();
  }

  async main() {
    // console.log('hello', this.bookmarks, this.rawArgs, this.cmdArgs);
    const mainCmd = this.cmdArgs[0] as string;
    const askedForHelp = this.rawArgs['help'];
    const debug = this.rawArgs['debug'];
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

  async delete(name: string) {
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

  async help() {
    console.log(`
ssh-bm cms -> ssh into cms
ssh-bm add cms user@23.12.12.12 -> adds bm
ssh-bm update cms user@23.12.12.13 -> updates
ssh-bm delete cms -> removes cms
ssh-bm find cms -> prints bookmark to terminal
ssh-bm X --help -> print help statement
ssh-bm reset -> resets collection after confirmation`
);
  }

  async reset() {
    await this.bookmarks.reset();
    Deno.exit(1);
  }
}


// console.log(readBms);


const app = new App(rawArgs, cmdArgs);
await app.main();