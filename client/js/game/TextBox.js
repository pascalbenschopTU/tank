class TextBox {
  /**
   * Constructor for the Leaderboard class.
   * @param {container} container The container element for the leaderboard
   */
  constructor(container) {
    this.container = container
  }

  /**
   * 
   * @param {HTMLElement} textbox 
   * @returns TextBox object
   */
  static create(textbox) {
    return new TextBox(textbox)
  }

  /**
   * Add a text item to the textbox
   * @param {string} text 
   */
  addListItem(text, id, color) {
    const listitem = document.createElement('li');
    listitem.appendChild(document.createTextNode(text))
    listitem.id = id
    listitem.style.color = color;

    this.container.appendChild(listitem);
  }

  /**
   * Updates the leaderboard with the list of current players.
   * @param {Array<Player>} players The list of current players
   */
  update(players) {
    let length = this.container.children.length;
    for (let i = 0; i < length; i++) {
      let child = this.container.children[i];
      if (child && child.id != "Console")
        this.container.removeChild(child)
    }
    
    players.sort((a, b) => { return b.kills - a.kills })
    players.slice(0, 10).forEach(player => {
      this.addListItem(`${player.name} - Kills: ${player.kills} Deaths: ${player.deaths}`, "scoreboard")
    })
  }
}

module.exports = TextBox