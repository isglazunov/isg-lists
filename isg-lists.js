// Lists / isg-lists
// https://github.com/isglazunov/isg-lists
// isglazunov / Ivan Sergeevich Glazunov / isglazunov@gmail.com

// Lists
// Синтетическая концепция суперпозиции позволяет наследнику Superposition находиться сразу в нескольких List.
(function() {
    
    // Локальный указатель версии модуля Lists
    var version = '0.1.0';
    
    // Конструктор Lists
    // new Lists() Function
    var Lists = function() {
        var lists = this;
        
        // Публичный указатель версии модуля
        // Условно доступен только для чтения.
        lists._version = version;
        
        // .call(this Position, pos Position) Function
        var positionPrepend = function(pos) {
            if (this._prev) {
                this._prev._next = pos;
                pos._prev = this._prev;
            }
            this._prev = pos;
            pos._next = this;
        };
        
        // .call(this Position, pos Position) Function
        var positionAppend = function(pos) {
            if (this._next) {
                this._next._prev = pos;
                pos._next = this._next;
            }
            this._next = pos;
            pos._prev = this;
        };
        
        // .call(this Position) Function
        var positionRemove = function() {
            if (this._prev && this._next) {
                this._prev._next = this._next;
                this._next._prev = this._prev;
                
            } else if (this._prev && !this._next) {
                this._prev._next = undefined;
            
            } else if (!this._prev && this._next) {
                this._next._prev = undefined;
            }
            
            this._next = this._prev = undefined;
        };
        
        // Сравнение позиций в списке, и поиск нового места для позиции this.
        // .call(this Position, comparator(source Superposition, target Superposition) => Boolean Function) Function // => [parent Position, edge Boolean, moved Boolean]
        var positionCompare = function(comparator) {
            var target = this;
            
            var parent = target._prev;
            var edge = false;
            var moved = false;
            
            if (target._list._first == target) {
                edge = true;
                
            } else {
                var allow = true;
                var source = target._prev;
                
                while(allow) {
                    parent = source;
                    
                    if (!comparator(source._super, target._super)) {
                        moved = true;
                        
                        if (source._prev) source = source._prev;
                        else {
                            edge = true;
                            allow = false;
                        }
                    } else allow = false;
                }
            }
            
            return [parent, edge, moved];
        };
        
        // Переместить позицию в наиболее подходящую позицию согласно условию.
        // .call(this Position, comparator(source Superposition, target Superposition) => Boolean Function) Function
        var positionSort = function(comparator) { (function(parent, edge, moved){
            if (moved) {
                if (edge) {
                    this._list.prepend([this._super], true);
                } else {
                    parent.append([this._super], true);
                }
            }
        }).apply(this, positionCompare.call(this, comparator)); };
        
        // .call(this List, pos Position) Function
        var listRemove = function(pos) {
            if (this._first == pos && this._last == pos) {
                this._first = this._last = undefined;
            } else if (!this._first !== pos && this._last == pos) {
                if (pos._prev) this._last = pos._prev;
                else throw new Error('position is not complete');
            } else if (this._first == pos && !this._last !== pos) {
                if (pos._next) this._first = pos._next;
                else throw new Error('position is not complete');
            }
        };
        
        // Список двусвязных позиций
        lists.List = (function() {
            
            // У каждого списка уникальный, в рамках экземпляра Lists, идентификатор.
            var id = 0;
            
            // new .List() Function
            var List = function() {
                this.__id = id++; // Идентификатор списка.
                
                // Длинна списка. Изменяется встроенными методами.
                this._length = 0;
                
                // Указатели
                this._first; // Первая позиция в списке.
                this._last; // Последняя позиция в списке.
            };
            
            // Удаляет множество позиций суперпозиций из списка.
            List.prototype.remove = (function() {
                
                // .remove(superpositions.. Superposition) Function
                return function(superpositions) {
                    for (var s in superpositions) {
                        superpositions[s].in(this).remove();
                    }
                };
            }) ();
            
            // Добавляет множество позиций суперпозиций в начало списка.
            List.prototype.prepend = (function() {
                
                // (list List, pos Position) Function
                var forcePrependTrue = function(list, pos) {
                    if (pos._exists) pos.remove();
                    
                    forcePrependFalse(list, pos);
                };
                
                // (list List, pos Position) Function
                var forcePrependFalse = function(list, pos) {
                    if (pos._exists) return;
                    
                    if (list._first) {
                        positionPrepend.call(list._first, pos);
                        list._first = pos;
                    } else {
                        list._first = list._last = pos;
                    }
                    
                    list._length++;
                    pos._exists = true;
                };
                
                // .prepend(superpositions.. Superposition, force = false Boolean) Function
                return function(superpositions, force) {
                    var action = force? forcePrependTrue : forcePrependFalse
                    for (var s = superpositions.length-1; s > 0-1; s--) {
                        action(this, superpositions[s].in(this));
                    }
                };
            }) ();
            
            // Добавляет множество позиций суперпозиций в конец списка.
            List.prototype.append = (function() {
                
                // (list List, pos Position) Function
                var forceAppendTrue = function(list, pos) {
                    if (pos._exists) pos.remove();
                    
                    forceAppendFalse(list, pos);
                };
                
                // (list List, pos Position) Function
                var forceAppendFalse = function(list, pos) {
                    if (pos._exists) return;
                    
                    if (list._last) {
                        positionAppend.call(list._last, pos);
                        list._last = pos;
                    } else {
                        list._first = list._last = pos;
                    }
                    
                    list._length++;
                    pos._exists = true;
                };
                
                // .append(superpositions.. Superposition, force = false Boolean)  Function
                return function(superpositions, force) {
                    var action = force? forceAppendTrue : forceAppendFalse
                    for (var s = 0; s < superpositions.length; s++) {
                        action(this, superpositions[s].in(this));
                    }
                };
            }) ();
            
            // .toArray(order Boolean) // => superpositions.. Superposition
            List.prototype.toArray = function(order) {
                var array = [];
                
                if (this._first) {
                    var now = this._first;
                    do {
                        array.push(now._super);
                    } while (now._next && (now = now._next))
                }
                
                return array;
            };
            
            // Добавляет множество позиций суперпозиций согласно компаратору.
            // (comparator(source Superposition, target Superposition) => Boolean Function, superposition Superposition) Function
            List.prototype.add = function(comparator, superpositions) {
                for (var s in superpositions) {
                    superpositions[s].add(comparator);
                }
            };
            
            // Сортирует все позиции в списке от первой до последней согласно компаратору.
            List.prototype.sort = function(comparator) {
                var list = this;
                
                if (list._first) {
                    if (list._first._next) {
                        var now = this._first._next;
                        do {
                            var pos = now;
                            now = now._next;
                            positionSort.call(pos, comparator);
                        } while (now)
                    }
                }
            };
            
            return List;
            
        }) ();
        
        // Позиция в двусвязном списке
        // Условно не для пользовательской сборки. Позиции сами создаются при запросе положения суперпозиции в списке.
        lists.Position = (function() {
            
            // new .Position(list List, sup Superposition) Function
            var Position = function(list, sup) {
                
                // Состояние позиции, включена ли она в список.
                this._exists = false;
                
                // Указатели
                this._prev; // Предыдущая позиция в списке.
                this._next; // Следующая позиция в списке.
                
                this._list = list; // Список
                this._super = sup; // Суперпозиция
            };
            
            // Удаляет позицию суперпозиции из списка.
            // .remove() Function
            Position.prototype.remove = function() {
                if (this._exists) {
                    listRemove.call(this._list, this);
                    positionRemove.call(this);
                    this._exists = false;
                }
            };
            
            // Добавляет множество позиций суперпозиций до позиции.
            // .prepend(superpositions.. Superposition, force = false Boolean) Function
            Position.prototype.prepend = (function() {
                
                // (self Position, list List, pos Position) Function
                var forcePrependTrue = function(self, list, pos) {
                    if (pos._exists) pos.remove();
                    
                    forcePrependFalse(self, list, pos);
                };
                
                // (self Position, list List, pos Position) Function
                var forcePrependFalse = function(self, list, pos) {
                    if (pos._exists) return;
                    
                    positionPrepend.call(self, pos);
                    
                    list._length++;
                    pos._exists = true;
                };
                
                return function(superpositions, force) {
                    var action = force? forcePrependTrue : forcePrependFalse
                    if (this == this._list._first) {
                        return this._list.prepend(superpositions, force);
                        
                    } else {
                        for (var s = 0; s < superpositions.length; s++) {
                            action(this, this._list, superpositions[s].in(this._list));
                        }
                    }
                };
            }) ();
            
            // Добавляет множество позиций суперпозиций после позиции.
            // .append(superpositions.. Superposition, force = false Boolean) Function
            Position.prototype.append = (function() {
                
                // (self Position, list List, pos Position) Function
                var forceAppendTrue = function(self, list, pos) {
                    pos.remove();
                    forceAppendFalse(self, list, pos);
                };
                
                // (self Position, list List, pos Position) Function
                var forceAppendFalse = function(self, list, pos) {
                    if (pos._exists) return;
                    
                    positionAppend.call(self, pos);
                    
                    list._length++;
                    pos._exists = true;
                };
                
                return function(superpositions, force) {
                    var action = force? forceAppendTrue : forceAppendFalse
                    if (this == this._list._last) {
                        return this._list.append(superpositions, force);
                        
                    } else {
                        for (var s = superpositions.length-1; s > 0-1; s--) {
                            action(this, this._list, superpositions[s].in(this._list));
                        }
                    }
                };
            }) ();
            
            // Добавляет позицию в список, либо пересортирует ее в списке согласно компаратору.
            // (comparator(source Superposition, target Superposition) => Boolean Function) Function // => Position
            Position.prototype.add = function(comparator) {
                this._list.append([this._super], true);
                positionSort.call(this, comparator);
                return this;
            };
            
            return Position;
            
        }) ();
        
        // Суперпозиция позиций
        lists.Superposition = (function() {
            
            // new .Superposition() Function
            var Superposition = function() {
                this.__lists = {}; // Ссылки на списки к которым относится суперпозиция.
            };
            
            // Возвращает позицию суперпозиции в определенном списке.
            // .in(list List) Function // => Position
            Superposition.prototype.in = function(list) {
                if (this.__lists[list._id]) return this.__lists[list._id];
                else this.__lists[list._id] = new lists.Position(list, this);
                
                return this.__lists[list._id];
            };
            
            return Superposition;
            
        }) ();
    };
    
    // Публичный указатель версии модуля
    // Условно доступен только для чтения.
    Lists._version = version;
    
    // Connector
    // Позволяет получить доступ к модулю из других модулей.
    (function(Lists) {
        
        // Автоматический сборщик
        (function(Lists) {
            
            // Define
            // Подключение с помощью модуля Require.js на клиентской стороне.
            // ~ define(['isg-lists'], callback(lists Lists) Function)
            if(typeof(define) !== 'undefined' && define.amd) {
                define(['module'], function(module) {
                    module.exports = new Lists();
                });
            }
            
            // Require
            // Подключение с помощью Node.js модульной системы.
            // ~ require('isg-lists')
            if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined' && typeof(require) == 'function') {
                module.exports = new Lists();
            }
            
        }) (Lists);
        
        // Ручной сборщик
        // Пользователь контролирует наличие и версию передаваемых модулей в конструктор.
        (function(Lists) {
            
            // Window
            // Lists будет доступен глобально на клиентской стороне.
            if(typeof(window) !== 'undefined') window.isgLists = Lists;
            
            // Global
            // Lists будет доступен глобально на серверной стороне.
            if(typeof(global) !== 'undefined') global.isgLists = Lists;
            
        }) (Lists);
        
    }) (Lists);

}) ();

// Версии

// 0.1.0
// Наследуется функционал https://github.com/isglazunov/blackstone/tree/0.1.0

// Правила

// Комментарии
/*
// Заголовок // Ответ на вопрос - что это?
// Описание. // Ответ на вопрос - что делает?
// ~ // Например
// § // Обязательная переменная
// (variable Constructor) // Один экземпляр Constructor
// (variables... Constructor) // Множество экземпляров Constructor
// (variables.. Constructor) // Массив экземпляров Constructor
// ([variable Constructor]) // На обязательный аргумент
// ([variable Constructor[, variable Constructor]]) // Не обязательный аргумент зависящий от другого в порядке передачи
// ([variable Constructor], [variable Constructor]) // Назависимые обязательные аргументы
// => // Описание возвращаемых данных
*/

// Предпологается что пользователь библиотеки следует инструкциям использования каждого модуля и метода.

// Описание поведения.
// `*!` нужно понять что это за переменная самим.
// `*()` список аргументов для вызова переменной.
// `new *()` метод следует использовать как конструктор
// `(variable Constructor)` variable переменная экземпляр Constructor

// Модули
/*
Каждый логический блок кода - модуль, отделяется собственным контекстом - фабрикой.
`(function() {})();`
Это позволяет четко контролировать exports и import модуля, а так-же обеспечивает удобный фолдинг.
*/

// Префиксы
/*
`_` Системная переменная, условно доступная только для чтения.
`__` Небезопасная переменная, условно недоступная.
*/