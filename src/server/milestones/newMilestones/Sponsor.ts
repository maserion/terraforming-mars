import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {CardType} from '../../../common/cards/CardType';


export class Sponsor extends BaseMilestone {
  constructor() {
    super(
      'Sponsor',
      '3 cards that have cost of 20 MC or more',
      3);
  }
  public getScore(player: IPlayer): number {
    return player.playedCards
      .filter((card) => (card.cost >= 20) && (card.type === CardType.ACTIVE || card.type === CardType.AUTOMATED)).length;
  }
}

