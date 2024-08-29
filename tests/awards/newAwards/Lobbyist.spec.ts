import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {Lobbyist} from '../../../src/server/milestones/newMilestones/Lobbyist';
import {TestPlayer} from '../../TestPlayer';
import {BoardName} from '../../../src/common/boards/BoardName';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {testGame} from '../../TestingUtils';

describe('Lobbyist', function() {
  let milestone: Lobbyist;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;
  let turmoil: Turmoil;

  beforeEach(function() {
    milestone = new Lobbyist();
    [game, player, player2] = testGame(2, {boardName: BoardName.ARABIA_TERRA, turmoilEnabled: true}); // Adjust if needed
    turmoil = game.turmoil; // Ensure turmoil is enabled
  });

  it('Can claim with all 7 delegates present', () => {
    // Assume player starts with 7 delegates (or equivalent)
    turmoil.setDelegateCount(player, 7);

    expect(milestone.canClaim(player)).to.be.true;
  });

  it('Cannot claim with fewer than 7 delegates', () => {
    // Player has fewer delegates
    turmoil.setDelegateCount(player, 5);

    expect(milestone.canClaim(player)).to.be.false;
  });

  it('Cannot claim if turmoil is not enabled', () => {
    // Disable turmoil for this test
    const [gameWithoutTurmoil] = testGame(2, {boardName: BoardName.ARABIA_TERRA, turmoilEnabled: false});
    const playerWithoutTurmoil = gameWithoutTurmoil.players[0];

    expect(milestone.canClaim(playerWithoutTurmoil)).to.be.false;
  });

  it('Can claim with turmoil enabled and exact delegate count', () => {
    turmoil.setDelegateCount(player, 7); // Set the exact required count
    expect(milestone.getScore(player)).to.equal(0); // Since all delegates are present, the score should be 0

    expect(milestone.canClaim(player)).to.be.true;
  });

  it('Cannot claim with turmoil enabled and insufficient delegates', () => {
    turmoil.setDelegateCount(player, 4); // Set fewer than required delegates

    expect(milestone.getScore(player)).to.be.greaterThan(0); // Score should reflect the number of delegates short of the requirement
    expect(milestone.canClaim(player)).to.be.false;
  });
});
