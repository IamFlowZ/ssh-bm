export class BookMark {
  constructor(
    public connectionString: string,
    public name: string,
    public idFilePath?: string,
  ) {
  }

  validate() {}
}

export class BookMarkCollection {
  public bookmarks: { [k: string]: BookMark };
  constructor() {
    this.bookmarks = this.load();
  }

  put(bookmark: BookMark) {
    this.bookmarks[bookmark.name] = bookmark;
    try {
      this.save();
    } catch (err) {
      console.error(`Could not add ${bookmark.name}. ${err}`);
      return 1;
    }
    console.log(`Added ${bookmark.name}!`);
    return 0;
  }

  delete(name: string) {
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
        console.log(
          `Multiple instances found when looking for ${connectionString}`,
        );
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

  private findByConnStr(connStr: string) {
    return Object.values(this.bookmarks).filter(
      (bookmark: BookMark) => bookmark.connectionString === connStr,
    );
  }

  private checkForFile() {
    try {
      Deno.statSync("./bookmarks.json");
      return true;
    } catch (err) {
      return false;
    }
  }

  private async save() {
    await Deno.writeTextFile(
      "./bookmarks.json",
      JSON.stringify(this.bookmarks),
    );
  }

  /**
   * if file exists, load it.
   * otherwise, create a new file and return empty.
   * @returns {[k: string]: BookMark}
   */
  private load() {
    if (this.checkForFile()) {
      const readBms = Deno.readTextFileSync("./bookmarks.json");
      return JSON.parse(readBms);
    }
    this.reset();
    return {};
  }

  async reset() {
    this.bookmarks = {};
    await Deno.writeTextFile("./bookmarks.json", JSON.stringify({}));
  }
}
