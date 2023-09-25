using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Example3.Unstable_Unicorns.Code
{
    public class Player
    {
        public string Name { get; set; }
        public CardCollection Hand { get; }
        public CardCollection Stable { get; }
        private const string UnicornType = "Unicorn";

        public int getNumUnicornsInStable()
        {
            int count = 0;
            foreach (Card card in Stable.getCollection())
                if (card.Type == UnicornType)
                    count++;
            return count;
        }

    }
}
