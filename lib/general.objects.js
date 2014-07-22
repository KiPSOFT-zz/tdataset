/* general objects kütüphanesi */
"use strict";

var TList = function() {
		var FList = new Array();
		this.Add = function(Item) {
			if(Item != null) {
				FList.push(Item);
				return FList.length - 1;
			}
		};
		this.Clear = function() {
			FList = [];
		};
		this.Delete = function(Index) {
			if(Index < 0 && Index >= FList.length - 1) throw Error("List index out of bounds. (" + Index + ")");
			if(Index < FList.length) FList.splice(Index, 1);
		};
		this.Get = function(Index) {
			if(Index > FList.length - 1) throw Error("List index out of bounds. (" + Index + ")");
			return FList[Index];
		};
		this.IndexOf = function(Item) {
			return FList.indexOf(Item, 0);
		};
		this.Insert = function(Index, Item) {
			FList.splice(Index, 0, Item);
		};
		this.Put = function(Index, Item) {
			FList[Index] = Item;
		};
		var RawList = function() {
			return FList;
		};
		Object.defineProperty(this, 'RawList', {
			get: RawList,
			enumerable: true,
			configurable: true			
		})
		var GetCount = function() {
				return FList.length;
			};
		Object.defineProperty(this, 'Count', {
			get: GetCount,
			enumerable: true,
			configurable: true
		});
	}

var TCollection = function () {
	this.Objects = new TList();
	this.Keys = new TList();
	this.Add = function (index, key, object) {
		if (this.Keys.IndexOf(key)==-1)	{
			if (index == -1) {
				this.Keys.Add(key);
				this.Objects.Add(object);
			}
			else {
				this.Keys.Insert(index, key);
				this.Objects.Insert(index, object);
			}
		}
		else { throw new Error("key is already added."); }
	};
	this.Get = function(key) {
		if (typeof(key) == "numeric" || typeof(key) == "number") 
			return this.Objects.Get(key);		
		else
		{
			return this.Objects.Get(this.Keys.IndexOf(key));
		}
	};
	this.IndexOf = function(key) {
		return this.Keys.IndexOf(key);
	};
	this.Count = function() {
		return this.Keys.Count;
	};
	this.RawKeys = function() {
		return this.Keys.RawList;
	};
}

var TJSON = function () {
	this.Base = {};
	this.AddObject = function(name) {
		this.Base[name] = {};
		return this.Base[name];
	};
	this.AddArray = function(name) {
		this.Base[name] = new Array();
		return this.Base[name];
	},
	this.GetJSON = function() {
		return this.Base;
	}
}

exports.TList = TList;
exports.TCollection = TCollection;
exports.TJSON = TJSON;