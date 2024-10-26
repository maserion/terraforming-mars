import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {CardType} from '../../../src/common/cards/CardType';
import {Administrator} from '../../../src/server/awards/newAwards/Administrator';

describe('Administrator', () => {
  let award: Administrator;
  let player: TestPlayer;

  beforeEach(() => {
    award = new Administrator();
    [/* game */, player] = testGame(2);
  });

  it('Counts tags', () => {
    expect(award.getScore(player)).to.eq(0);

    player.playedCards.push(fakeCard({tags: []}));
    expect(award.getScore(player)).to.eq(1);

    player.playedCards.push(fakeCard({tags: []}));
    expect(award.getScore(player)).to.eq(2);

    player.playedCards.push(fakeCard({tags: [Tag.EARTH]}));
    expect(award.getScore(player)).to.eq(2);
  });

  it('Does count wild tags', () => {
    expect(award.getScore(player)).to.eq(0);

    player.playedCards.push(fakeCard({tags: []}));
    expect(award.getScore(player)).to.eq(1);

    player.playedCards.push(fakeCard({tags: [Tag.WILD]}));
    expect(award.getScore(player)).to.eq(2);
  });

  it('Does not count events', () => {
    expect(award.getScore(player)).to.eq(0);

    player.playedCards.push(fakeCard({tags: []}));
    expect(award.getScore(player)).to.eq(1);

    player.playedCards.push(fakeCard({tags: [], type: CardType.EVENT}));
    expect(award.getScore(player)).to.eq(1);
  });
});
