import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IActionCard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import * as constants from '../../../common/constants';

export class VenusShuttles extends Card implements IActionCard {
  constructor() {
    super({
      name: CardName.VENUS_SHUTTLES,
      type: CardType.ACTIVE,
      tags: [Tag.VENUS],
      cost: 9,

      behavior: {
        addResourcesToAnyCard: {
          count: 2,
          tag: Tag.VENUS,
          type: CardResource.FLOATER,
          autoSelect: true,
        },
      },

      metadata: {
        cardNumber: 'P89',
        description: 'Add 2 floaters to ANY VENUS CARD.',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 12 MC to raide Venus 1 step. This cost is REDUCED BY 1 FOR EACH VENUS TAG you have.', (eb) =>
            eb.megacredits(12).text('(').megacredits(-1).slash().tag(Tag.VENUS).text(')').startAction.venus(1));
        }),
      },
    });
  }

  public canAct(player: IPlayer) {
    let tagCount = player.tags.count(Tag.VENUS);
    tagCount = Math.min(tagCount, 12);
    if (player.game.getVenusScaleLevel() >= constants.MAX_VENUS_SCALE) {
      this.warnings.add('maxvenus');
    }
    return player.canAfford(12-tagCount);
  }

  public action(player: IPlayer) {
    let tagCount = player.tags.count(Tag.VENUS);
    tagCount = Math.min(tagCount, 12);
    player.stock.deduct(Resource.MEGACREDITS, 12-tagCount);
    player.game.increaseVenusScaleLevel(player, 1);
    return undefined;
  }
}
