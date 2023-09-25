using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Example3.Unstable_Unicorns.Code
{
    public class Game
    {
        private CardCollection Deck;
        private CardCollection Discard;
        private CardCollection Removed;
        private CardCollection Nursery;
        private List<Player> playerList;
        private Player currentPlayer;
        private int currentIndex = 0;
        private const string UnicornType = "Unicorn";
        //private bool isTwoPlayer = false;
        public Game() 
        {
            playerList = new List<Player>();
            Deck = new CardCollection();
            Discard = new CardCollection();
            Nursery = new CardCollection();
        }
        public void Deal() 
        {
            //deal 5 cards to every player
            foreach (int i in Enumerable.Range(1, 5))
            {
                foreach (Player player in playerList)
                {                    
                    player.Hand.AddCard(Deck.PopTop());
                }
            }
            //each player starts with a baby
            foreach (Player player in playerList)
                player.Stable.AddCard(Nursery.PopTop());
        }
        public void Start() 
        {
            while(true)
                PlayTurn();
        }
        public void Setup()
        {
            //deal
            Deal();
            //assign currentplayer
            currentPlayer = playerList.First();
            //PLAY
            Start();

        }
        public void PlayTurn()
        {
            //execute begining of turn Phase
            Beginning();
            //player draws
            Draw();
            //playInstant

            //checkwinner
            if (isDeckOut())
                calculateWinner();
                //player action phase
            
            PlayAction();
            //play neigh

            if (isGameOver()) 
            {
                //currentPlayer Wins
                Winner(currentPlayer);
            }
                
            //end turn
            NextTurn();
        }

        private void Beginning()
        {
            throw new NotImplementedException();
        }

        public bool isGameOver()
        {
            int count = 0;
            //current player 7 unicorns in stable
            foreach (Card card in currentPlayer.Stable.getCollection())
            {
                if (card.Type == UnicornType)
                    count++;
                if (count == 7)
                    return true;
            }
            return false;
        }
        public bool isDeckOut()
        {
            if (Deck.Count() == 0)
                return true;
            return false;
        }
        public void PlayAction() 
        { 
            //take input from player
        }
        public void NextTurn()
        {
            currentIndex++;
            if (currentIndex == playerList.Count)
                currentIndex = 0;
            currentPlayer = playerList.ElementAt(currentIndex);
        }
        public void Draw()
        {
            int deckCount = Deck.getCollection().Count - 1;
            Card card = Deck.getCollection().ElementAt(deckCount);
            Deck.getCollection().RemoveAt(deckCount);
            currentPlayer.Hand.getCollection().Add(card);
        }
        public void calculateWinner() 
        {
            //check Unicorns
            List<Player> players = new List<Player>();
            List<Player> winners = new List<Player>();
            //make copy of playerlist
            foreach (Player player in playerList)
                players.Add(player);
            //sorted by most unicorns to least in stable
            players.OrderBy(a=>a.getNumUnicornsInStable());
            //put top player as winner
            winners.Add(players[0]);
            //check for unicorn ties
            for (int i = 1; i < players.Count; i++)
            {
                if (players[i].getNumUnicornsInStable() == winners[0].getNumUnicornsInStable())
                    winners.Add(players[i]);
            }
            //if two or more players have same number of unicorns
            //then check letters of unicorns
            //if tie lose
            if (winners.Count > 1)
            {
                Dictionary<Player, int> letterWinners = new Dictionary<Player, int>();
                foreach (Player player in winners)
                {
                    int totalLetters = 0;
                    foreach (Card card in player.Stable.getCollection())
                    {
                        if (card.Type == UnicornType)
                            totalLetters += card.Name.Length;
                    }
                    letterWinners.Add(player, totalLetters);
                }
                //orderby top number
                letterWinners.OrderBy(a => a.Value);
                bool first = true;
                KeyValuePair<Player, int> theWinner = new KeyValuePair<Player, int>();
                List<Player> actualWinners = new List<Player>();
                foreach (var kV in letterWinners)
                {
                    if (first)
                    {
                        theWinner = letterWinners.First();
                        actualWinners.Add(theWinner.Key);
                    }
                    else if (kV.Value == theWinner.Value)
                    {
                        actualWinners.Add(theWinner.Key);
                    }
                }
                if (actualWinners.Count > 1)
                    //nowinners
                    noWinners();
                else
                    Winner(actualWinners[0]);
            }
            else
            {
                Winner(winners[0]);
            }
        }
        public void Winner(Player player)
        { 
            //show winners 
            //end game
            //offer replay
        }
        public void noWinners() 
        {
            //show no winners
            //end game
            //offer replay
        }
        public void ValidateMove() 
        { 
            
        }
    }
}
