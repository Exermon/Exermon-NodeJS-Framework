"use strict";
/*
 Copyright (c) 2020 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
exports.__esModule = true;
exports._getClassId = exports.getClassByName = exports._getClassById = exports.unregisterClass = exports.setClassAlias = exports.setClassName = exports._setClassId = exports._nameToClass = exports._idToClass = exports.clear = exports.isChildClassOf = exports.getSuper = exports.extend = exports.mixin = exports.addon = exports.getPropertyDescriptor = exports.shiftArguments = exports.formatStr = exports.obsoletes = exports.obsolete = exports.getClassName = exports.createMap = exports.set = exports.get = exports.getset = exports.value = exports.isEmptyObject = exports.isString = exports.isNumber = exports.getMetaData = exports.strictEq = exports.deepCopy = void 0;
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepCopy = deepCopy;
function strictEq(a, b) {
    if (typeof a != typeof b)
        return false;
    if (typeof a == "object")
        return JSON.stringify(a) == JSON.stringify(b);
    return a === b;
}
exports.strictEq = strictEq;
/**
 * 获取/创建元数据
 */
function getMetaData(type, key, default_) {
    var res = type[key] || (type[key] = default_);
    if ((res === null || res === void 0 ? void 0 : res.type) != type) {
        var keys = res ? Object.keys(res) : [];
        type[key] = keys.reduce(function (_res, key) {
            var val = res[key];
            if (val instanceof Array)
                _res[key] = val.slice(0); // 复制数组
            else if (typeof val == "object")
                _res[key] = Object.assign({}, val); // 复制对象（浅复制）
            else
                _res[key] = val;
            return _res;
        }, {});
        type[key].type = type;
    }
    return type[key];
}
exports.getMetaData = getMetaData;
/**
 * @packageDocumentation
 * @module core
 */
var aliasesTag = typeof Symbol === 'undefined' ? '__aliases__' : Symbol('[[Aliases]]');
var classNameTag = '__classname__';
var classIdTag = '__cid__';
/**
 * Check the object whether is number or not
 * If a number is created by using 'new Number(10086)', the typeof it will be "object"...
 * Then you can use this function if you care about this case.
 */
function isNumber(object) {
    return typeof object === 'number' || object instanceof Number;
}
exports.isNumber = isNumber;
/**
 * Check the object whether is string or not.
 * If a string is created by using 'new String("blabla")', the typeof it will be "object"...
 * Then you can use this function if you care about this case.
 */
function isString(object) {
    return typeof object === 'string' || object instanceof String;
}
exports.isString = isString;
/**
 * Checks if the object `obj` does not have one or more enumerable properties (including properties from proto chain).
 * @param obj The object.
 * @returns The result. Note that if the `obj` is not of type `'object'`, `true` is returned.
 */
function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}
exports.isEmptyObject = isEmptyObject;
/**
 * Define value, just help to call Object.defineProperty.<br>
 * The configurable will be true.
 * @param [writable=false]
 * @param [enumerable=false]
 */
exports.value = (function () {
    var descriptor = {
        value: undefined,
        enumerable: false,
        writable: false,
        configurable: true
    };
    return function (object, propertyName, value_, writable, enumerable) {
        descriptor.value = value_;
        descriptor.writable = writable;
        descriptor.enumerable = enumerable;
        Object.defineProperty(object, propertyName, descriptor);
        descriptor.value = undefined;
    };
})();
/**
 * Define get set accessor, just help to call Object.defineProperty(...).
 * @param [setter=null]
 * @param [enumerable=false]
 * @param [configurable=false]
 */
exports.getset = (function () {
    var descriptor = {
        get: undefined,
        set: undefined,
        enumerable: false
    };
    return function (object, propertyName, getter, setter, enumerable, configurable) {
        if (enumerable === void 0) { enumerable = false; }
        if (configurable === void 0) { configurable = false; }
        if (typeof setter === 'boolean') {
            enumerable = setter;
            setter = undefined;
        }
        descriptor.get = getter;
        descriptor.set = setter;
        descriptor.enumerable = enumerable;
        descriptor.configurable = configurable;
        Object.defineProperty(object, propertyName, descriptor);
        descriptor.get = undefined;
        descriptor.set = undefined;
    };
})();
/**
 * Define get accessor, just help to call Object.defineProperty(...).
 * @param [enumerable=false]
 * @param [configurable=false]
 */
exports.get = (function () {
    var descriptor = {
        get: undefined,
        enumerable: false,
        configurable: false
    };
    return function (object, propertyName, getter, enumerable, configurable) {
        descriptor.get = getter;
        descriptor.enumerable = enumerable;
        descriptor.configurable = configurable;
        Object.defineProperty(object, propertyName, descriptor);
        descriptor.get = undefined;
    };
})();
/**
 * Define set accessor, just help to call Object.defineProperty(...).
 * @param [enumerable=false]
 * @param [configurable=false]
 */
exports.set = (function () {
    var descriptor = {
        set: undefined,
        enumerable: false,
        configurable: false
    };
    return function (object, propertyName, setter, enumerable, configurable) {
        descriptor.set = setter;
        descriptor.enumerable = enumerable;
        descriptor.configurable = configurable;
        Object.defineProperty(object, propertyName, descriptor);
        descriptor.set = undefined;
    };
})();
/**
 * @en
 * A simple wrapper of `Object.create(null)` which ensures the return object have no prototype (and thus no inherited members).
 * This eliminates the need to make `hasOwnProperty` judgments when we look for values by key on the object,
 * which is helpful for performance in this case.
 * @zh
 * 该方法是对 `Object.create(null)` 的简单封装。
 * `Object.create(null)` 用于创建无 prototype （也就无继承）的空对象。
 * 这样我们在该对象上查找属性时，就不用进行 `hasOwnProperty` 判断，此时对性能提升有帮助。
 *
 * @param [forceDictMode=false] Apply the delete operator to newly created map object.
 * This causes V8 to put the object in "dictionary mode" and disables creation of hidden classes
 * which are very expensive for objects that are constantly changing shape.
 */
function createMap(forceDictMode) {
    var map = Object.create(null);
    if (forceDictMode) {
        var INVALID_IDENTIFIER_1 = '.';
        var INVALID_IDENTIFIER_2 = '/';
        // assign dummy values on the object
        map[INVALID_IDENTIFIER_1] = 1;
        map[INVALID_IDENTIFIER_2] = 1;
        delete map[INVALID_IDENTIFIER_1];
        delete map[INVALID_IDENTIFIER_2];
    }
    return map;
}
exports.createMap = createMap;
/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return "".
 * (modified from <a href="http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class">the code from this stackoverflow post</a>)
 * @param objOrCtor instance or constructor
 */
function getClassName(objOrCtor) {
    if (typeof objOrCtor === 'function') {
        var prototype = objOrCtor.prototype;
        if (prototype && prototype.hasOwnProperty(classNameTag) && prototype[classNameTag]) {
            return prototype[classNameTag];
        }
        var retval = '';
        //  for browsers which have name property in the constructor of the object, such as chrome
        if (objOrCtor.name) {
            retval = objOrCtor.name;
        }
        if (objOrCtor.toString) {
            var arr = void 0;
            var str = objOrCtor.toString();
            if (str.charAt(0) === '[') {
                // str is "[object objectClass]"
                arr = str.match(/\[\w+\s*(\w+)\]/);
            }
            else {
                // str is function objectClass () {} for IE Firefox
                arr = str.match(/function\s*(\w+)/);
            }
            if (arr && arr.length === 2) {
                retval = arr[1];
            }
        }
        return retval !== 'Object' ? retval : '';
    }
    else if (objOrCtor && objOrCtor.constructor) {
        return getClassName(objOrCtor.constructor);
    }
    return '';
}
exports.getClassName = getClassName;
/**
 * Defines a polyfill field for obsoleted codes.
 * @param object - YourObject or YourClass.prototype
 * @param obsoleted - "OldParam" or "YourClass.OldParam"
 * @param newExpr - "NewParam" or "YourClass.NewParam"
 * @param  [writable=false]
 */
function obsolete(object, obsoleted, newExpr, writable) {
    var extractPropName = /([^.]+)$/;
    var oldProp = extractPropName.exec(obsoleted)[0];
    var newProp = extractPropName.exec(newExpr)[0];
    function getter() {
        return this[newProp];
    }
    function setter(value_) {
        this[newProp] = value_;
    }
    if (writable) {
        (0, exports.getset)(object, oldProp, getter, setter);
    }
    else {
        (0, exports.get)(object, oldProp, getter);
    }
}
exports.obsolete = obsolete;
/**
 * Defines all polyfill fields for obsoleted codes corresponding to the enumerable properties of props.
 * @param obj - YourObject or YourClass.prototype
 * @param objName - "YourObject" or "YourClass"
 * @param props
 * @param [writable=false]
 */
function obsoletes(obj, objName, props, writable) {
    for (var obsoleted in props) {
        var newName = props[obsoleted];
        obsolete(obj, "".concat(objName, ".").concat(obsoleted), newName, writable);
    }
}
exports.obsoletes = obsoletes;
var REGEXP_NUM_OR_STR = /(%d)|(%s)/;
var REGEXP_STR = /%s/;
/**
 * A string tool to construct a string with format string.
 * @param msg - A JavaScript string containing zero or more substitution strings (%s).
 * @param subst - JavaScript objects with which to replace substitution strings within msg.
 * This gives you additional control over the format of the output.
 * @example
 * ```
 * import { js } from 'cc';
 * js.formatStr("a: %s, b: %s", a, b);
 * js.formatStr(a, b, c);
 * ```
 */
function formatStr(msg) {
    var subst = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        subst[_i - 1] = arguments[_i];
    }
    if (arguments.length === 0) {
        return '';
    }
    if (subst.length === 0) {
        return "".concat(msg);
    }
    var hasSubstitution = typeof msg === 'string' && REGEXP_NUM_OR_STR.test(msg);
    if (hasSubstitution) {
        for (var _a = 0, subst_1 = subst; _a < subst_1.length; _a++) {
            var arg = subst_1[_a];
            var regExpToTest = typeof arg === 'number' ? REGEXP_NUM_OR_STR : REGEXP_STR;
            if (regExpToTest.test(msg)) {
                var notReplaceFunction = "".concat(arg);
                msg = msg.replace(regExpToTest, notReplaceFunction);
            }
            else {
                msg += " ".concat(arg);
            }
        }
    }
    else {
        for (var _b = 0, subst_2 = subst; _b < subst_2.length; _b++) {
            var arg = subst_2[_b];
            msg += " ".concat(arg);
        }
    }
    return msg;
}
exports.formatStr = formatStr;
// see https://github.com/petkaantonov/bluebird/issues/1389
function shiftArguments() {
    var len = arguments.length - 1;
    var args = new Array(len);
    for (var i = 0; i < len; ++i) {
        args[i] = arguments[i + 1];
    }
    return args;
}
exports.shiftArguments = shiftArguments;
/**
 * Get property descriptor in object and all its ancestors.
 */
function getPropertyDescriptor(object, propertyName) {
    while (object) {
        var pd = Object.getOwnPropertyDescriptor(object, propertyName);
        if (pd) {
            return pd;
        }
        object = Object.getPrototypeOf(object);
    }
    return null;
}
exports.getPropertyDescriptor = getPropertyDescriptor;
function _copyprop(name, source, target) {
    var pd = getPropertyDescriptor(source, name);
    if (pd) {
        Object.defineProperty(target, name, pd);
    }
}
/**
 * Copy all properties not defined in object from arguments[1...n].
 * @param object Object to extend its properties.
 * @param sources Source object to copy properties from.
 * @return The result object.
 */
function addon(object) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    object = object || {};
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        if (source) {
            if (typeof source !== 'object')
                continue;
            for (var name_1 in source) {
                if (!(name_1 in object)) {
                    _copyprop(name_1, source, object);
                }
            }
        }
    }
    return object;
}
exports.addon = addon;
/**
 * Copy all properties from arguments[1...n] to object.
 * @return The result object.
 */
function mixin(object) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    object = object || {};
    for (var _a = 0, sources_2 = sources; _a < sources_2.length; _a++) {
        var source = sources_2[_a];
        if (source) {
            if (typeof source !== 'object')
                continue;
            for (var name_2 in source) {
                _copyprop(name_2, source, object);
            }
        }
    }
    return object;
}
exports.mixin = mixin;
/**
 * Derive the class from the supplied base class.
 * Both classes are just native javascript constructors, not created by `Class`, so
 * usually you will want to inherit using [[Class]] instead.
 * @param base The baseclass to inherit.
 * @return The result class.
 */
function extend(cls, base) {
    for (var p in base) {
        if (base.hasOwnProperty(p)) {
            cls[p] = base[p];
        }
    }
    cls.prototype = Object.create(base.prototype, {
        constructor: {
            value: cls,
            writable: true,
            configurable: true
        }
    });
    return cls;
}
exports.extend = extend;
/**
 * Get super class.
 * @param constructor The constructor of subclass.
 */
function getSuper(constructor) {
    var proto = constructor.prototype; // binded function do not have prototype
    var dunderProto = proto && Object.getPrototypeOf(proto);
    return dunderProto && dunderProto.constructor;
}
exports.getSuper = getSuper;
/**
 * Checks whether subclass is child of superclass or equals to superclass.
 */
function isChildClassOf(subclass, superclass) {
    if (subclass && superclass) {
        if (typeof subclass !== 'function') {
            return false;
        }
        if (typeof superclass !== 'function') {
            return false;
        }
        if (subclass === superclass) {
            return true;
        }
        for (;;) {
            subclass = getSuper(subclass);
            if (!subclass) {
                return false;
            }
            if (subclass === superclass) {
                return true;
            }
        }
    }
    return false;
}
exports.isChildClassOf = isChildClassOf;
/**
 * Removes all enumerable properties from object.
 */
function clear(object) {
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var key = _a[_i];
        delete object[key];
    }
}
exports.clear = clear;
function isTempClassId(id) {
    return typeof id !== 'string';
}
// id registration
exports._idToClass = createMap(true);
exports._nameToClass = createMap(true);
function setup(tag, table) {
    return function (id, constructor) {
        // deregister old
        if (constructor.prototype.hasOwnProperty(tag)) {
            delete table[constructor.prototype[tag]];
        }
        (0, exports.value)(constructor.prototype, tag, id);
        // register class
        if (id) {
            var registered = table[id];
            if (registered && registered !== constructor) {
                var err = "A Class already exists with the same ".concat(tag, " : \"").concat(id, "\".");
            }
            else {
                table[id] = constructor;
            }
            // if (id === "") {
            //    console.trace("", table === _nameToClass);
            // }
        }
    };
}
/**
 * Register the class by specified id, if its classname is not defined, the class name will also be set.
 * @method _setClassId
 * @param classId
 * @param constructor
 * @private
 */
exports._setClassId = setup('__cid__', exports._idToClass);
var doSetClassName = setup('__classname__', exports._nameToClass);
/**
 * Register the class by specified name manually
 * @method setClassName
 * @param className
 * @param constructor
 */
function setClassName(className, constructor) {
    doSetClassName(className, constructor);
    // auto set class id
    if (!constructor.prototype.hasOwnProperty(classIdTag)) {
        var id = className;
        if (id) {
            (0, exports._setClassId)(id, constructor);
        }
    }
}
exports.setClassName = setClassName;
/**
 * @en Set an alias name for class.
 * If `setClassAlias(target, alias)`, `alias` will be a single way short cut for class `target`.
 * If you try `js.getClassByName(alias)`, you will get target.
 * But `js.getClassName(target)` will return the original name of `target`, not the alias.
 * @zh 为类设置别名。
 * 当 `setClassAlias(target, alias)` 后，
 * `alias` 将作为类 `target`的“单向 ID” 和“单向名称”。
 * 因此，`_getClassById(alias)` 和 `getClassByName(alias)` 都会得到 `target`。
 * 这种映射是单向的，意味着 `getClassName(target)` 和 `_getClassId(target)` 将不会是 `alias`。
 * @param target Constructor of target class.
 * @param alias Alias to set. The name shall not have been set as class name or alias of another class.
 */
function setClassAlias(target, alias) {
    var nameRegistry = exports._nameToClass[alias];
    var idRegistry = exports._idToClass[alias];
    var ok = true;
    if (nameRegistry && nameRegistry !== target) {
        ok = false;
    }
    if (idRegistry && idRegistry !== target) {
        ok = false;
    }
    if (ok) {
        var classAliases = target[aliasesTag];
        if (!classAliases) {
            classAliases = [];
            target[aliasesTag] = classAliases;
        }
        classAliases.push(alias);
        exports._nameToClass[alias] = target;
        exports._idToClass[alias] = target;
    }
}
exports.setClassAlias = setClassAlias;
/**
 * Unregister a class from fireball.
 *
 * If you dont need a registered class anymore, you should unregister the class so that Fireball will not keep its reference anymore.
 * Please note that its still your responsibility to free other references to the class.
 *
 * @param ...constructor - the class you will want to unregister, any number of classes can be added
 */
function unregisterClass() {
    var constructors = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        constructors[_i] = arguments[_i];
    }
    for (var _a = 0, constructors_1 = constructors; _a < constructors_1.length; _a++) {
        var constructor = constructors_1[_a];
        var p = constructor.prototype;
        var classId = p[classIdTag];
        if (classId) {
            delete exports._idToClass[classId];
        }
        var classname = p[classNameTag];
        if (classname) {
            delete exports._nameToClass[classname];
        }
        var aliases = p[aliasesTag];
        if (aliases) {
            for (var iAlias = 0; iAlias < aliases.length; ++iAlias) {
                var alias = aliases[iAlias];
                delete exports._nameToClass[alias];
                delete exports._idToClass[alias];
            }
        }
    }
}
exports.unregisterClass = unregisterClass;
/**
 * Get the registered class by id
 * @param classId
 * @return constructor
 * @private
 */
function _getClassById(classId) {
    return exports._idToClass[classId];
}
exports._getClassById = _getClassById;
/**
 * Get the registered class by name
 * @param classname
 * @return constructor of the class
 */
function getClassByName(classname) {
    return exports._nameToClass[classname];
}
exports.getClassByName = getClassByName;
/**
 * Get class id of the object
 * @param obj - instance or constructor
 * @param [allowTempId = true]   - can return temp id in editor
 * @return
 * @private
 */
function _getClassId(obj, allowTempId) {
    allowTempId = (typeof allowTempId !== 'undefined' ? allowTempId : true);
    var res;
    if (typeof obj === 'function' && obj.prototype.hasOwnProperty(classIdTag)) {
        res = obj.prototype[classIdTag];
        if (!allowTempId && isTempClassId(res)) {
            return '';
        }
        return res;
    }
    if (obj && obj.constructor) {
        var prototype = obj.constructor.prototype;
        if (prototype && prototype.hasOwnProperty(classIdTag)) {
            res = obj[classIdTag];
            if (!allowTempId && isTempClassId(res)) {
                return '';
            }
            return res;
        }
    }
    return '';
}
exports._getClassId = _getClassId;
