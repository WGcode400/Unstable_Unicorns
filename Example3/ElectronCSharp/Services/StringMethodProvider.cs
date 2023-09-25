using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace ElectronDisplay.Services
{
    public class StringMethodProvider
    {
        private readonly Dictionary<string, Func<object[], object>> _dictionary = new Dictionary<string, Func<object[], object>>();
        public void Register<T>(string command, Func<object[], T> function)
        {
            _dictionary.Add(command, args => function(args));
        }
        public void Register(string command, Action<object[]> function)
        {
            _dictionary.Add(command, args =>
            {
                function.Invoke(args);
                return null;
            });
        }
        public object Intercept<T>(string command, params object[] args)
        {
            if (_dictionary.ContainsKey(command))
                return (T)_dictionary[command].Invoke(args);
            else
                return null;
        }
        public void Intercept(string command, params object[] args)
        {
            _dictionary[command].Invoke(args);
        }
    }
}
