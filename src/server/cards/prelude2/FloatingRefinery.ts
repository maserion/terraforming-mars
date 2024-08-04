import {IProjectCard} from '../IProjectCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {Tag} from '../../../common/cards/Tag';
import {SelectCard} from '../../inputs/SelectCard';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class FloatingRefinery extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FLOATING_REFINERY,
      cost: 7,
      tags: [Tag.VENUS],
      resourceType: CardResource.FLOATER,

      behavior: {
        addResources: {tag: Tag.VENUS},
      },

      metadata: {
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 floater here.', (ab) => {
            ab.empty().startAction.resource(CardResource.FLOATER);
          }).br;
          b.or().br;
          b.action('Remove 2 floaters from ANY CARD to gain 1 titanium and 2 M€.', (eb) => {
            eb.minus().resource(CardResource.FLOATER, 2).startAction.titanium(1).megacredits(2);
          }).br.resource(CardResource.FLOATER, 1).slash().tag(Tag.VENUS);
        }),
        description: 'Add 1 floater here for each Venus tag you have.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.getResourceCount(CardResource.FLOATER) > 0;
  }

  public action(player: IPlayer) {
    const Floater2Cards = player.getCardsWith2Resources(CardResource.FLOATER);
    return new OrOptions(
      new SelectOption('Add 1 floater to this card', 
        'Add floater'
      ).andThen(() => {
        player.addResourceTo(this, {log: true});
        return undefined;
      }),
      new SelectCard('Remove 2 floaters from ANY CARD to gain 1 titanium and 2 M€',
        'Choose a card to spend 2 floaters from, to gain 1 titanium and 2 M€.', Floater2Cards)
        .andThen(([card]) => {
          player.removeResourceFrom(card, 2);
          player.stock.add(Resource.MEGACREDITS, 2, {log: true});
          player.stock.add(Resource.TITANIUM, 1, {log: true});
          return undefined
        })
    );
  }
}
