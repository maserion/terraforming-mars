import {Player} from '../Player';
import {Tags} from '../cards/Tags';
import {IProjectCard} from '../cards/IProjectCard';
import {DeferredAction} from './DeferredAction';
import {SelectCard} from '../inputs/SelectCard';
import {ResourceType} from '../ResourceType';
import {CardType} from '../cards/CardType';
import {SelectHowToPayDeferred} from './SelectHowToPayDeferred';
import {LogHelper} from '../LogHelper';

export class DrawCards implements DeferredAction {
  private constructor(
    public player: Player,
    public count: number = 1,
    public options: DrawCards.AllOptions = {},
    public cb: (cards: Array<IProjectCard>) => undefined | SelectCard<IProjectCard>,
  ) { }

  public execute() {
    if (this.count <= 0) return undefined;

    const game = this.player.game;
    const cards = game.dealer.drawProjectCardsByCondition(game, this.count, (card) => {
      if (this.options.resource !== undefined && this.options.resource !== card.resourceType) {
        return false;
      }
      if (this.options.cardType !== undefined && this.options.cardType !== card.cardType) {
        return false;
      }
      if (this.options.tag !== undefined && !card.tags.includes(this.options.tag)) {
        return false;
      }
      if (this.options.include !== undefined && !this.options.include(card)) {
        return false;
      }
      return true;
    });

    return this.cb(cards);
  };

  public static keepAll(player: Player, count: number = 1, options: DrawCards.DrawOptions = {}): DrawCards {
    return new DrawCards(player, count, options, (cards) => DrawCards.keep(player, cards));
  }

  public static keepSome(player: Player, count: number = 1, options: DrawCards.AllOptions = {}): DrawCards {
    return new DrawCards(player, count, options, (cards) => DrawCards.choose(player, cards, options));
  }
}

export namespace DrawCards {
  export interface DrawOptions {
    tag?: Tags,
    resource?: ResourceType,
    cardType?: CardType,
    include?: (card: IProjectCard) => boolean,
  }

  export interface ChooseOptions {
    keepMax?: number,
    paying?: boolean,
  }

  export interface AllOptions extends DrawOptions, ChooseOptions { }

  export function keep(player: Player, cards: Array<IProjectCard>, logText?: string): undefined {
    player.cardsInHand.push(...cards);
    LogHelper.logCardChange(player, logText || 'drew', cards.length);
    return undefined;
  }

  export function discard(player: Player, preserve: Array<IProjectCard>, discard: Array<IProjectCard>) {
    discard.forEach((card) => {
      if (preserve.find((f) => f.name === card.name) === undefined) {
        player.game.dealer.discard(card);
      }
    });
  }

  export function choose(player: Player, cards: Array<IProjectCard>, options: DrawCards.ChooseOptions): SelectCard<IProjectCard> {
    let max = options.keepMax || cards.length;
    console.log(max, options.keepMax, cards.length);
    if (options.paying) {
      max = Math.min(max, Math.floor(player.spendableMegacredits() / player.cardCost));
      console.log(max, player.spendableMegacredits(), player.cardCost);
    }
    const msg = options.paying ? (max === 0 ? 'You cannot afford any cards' : 'Select card(s) to buy') :
      `Select ${max} card(s) to keep`;
    const button = max === 0 ? 'Oh' : (options.paying ? 'Buy' : 'Select');
    const cb = (selected: Array<IProjectCard>) => {
      if (options.paying && selected.length > 0) {
        player.game.defer(
          new SelectHowToPayDeferred(player, selected.length * player.cardCost, {
            title: 'Select how to pay for cards',
            afterPay: () => {
              keep(player, cards, 'bought');
              discard(player, selected, cards);
            },
          }));
      } else {
        keep(player, selected);
        discard(player, selected, cards);
      }
      return undefined;
    };
    return new SelectCard(
      msg,
      button,
      cards,
      cb,
      max,
      0);
  }
}
