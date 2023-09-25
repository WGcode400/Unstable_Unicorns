using System;
using System.Collections.Generic;
using System.Linq;

namespace Example3.Unstable_Unicorns.Code
{
    public class CardCollection
    {
        private List<Card> _Collection;
        public CardCollection()
        {
            _Collection = new List<Card>();
        }
        public void LoadBaseCards()
        {

        }
        public List<Card> getCollection()
        {
            return _Collection;
        }
        public Card PopTop()
        {
            //remove last card from deck
            Card Card = _Collection.ElementAt(_Collection.Count - 1);
            _Collection.RemoveAt(_Collection.Count - 1);
            return Card;
        }
        public void AddCard(Card card)
        {
            _Collection.Add(card);
        }
        public void RemoveCard(Card card)
        {
            _Collection.Remove(card);
        }
        public int Count()
        {
            return _Collection.Count;
        }
        public void Shuffle() 
        {
            Random rng = new Random();
            _Collection.OrderBy(a => rng.Next()).ToList();
        }      
    }
}
  