'use strict';

var validate = { };

validate.isNumber = function(number){
	var str = number;
	var nospace = str.replace(/ /g,'');
	var nohyphen = str.replace(/-/g,'');
	var first = str.split('');
	var a = first[0];

	if(phonecheck(a) === true) {

		if(str.length === 7 && letterCheck(str) === true){
			return true;
		}
		if(nohyphen.length === 7 && letterCheck(nohyphen) === true){
		return true;
		}
		if(nospace.length === 7 && letterCheck(nospace) === true){
		return true;
		}
	}
	return false;
};

validate.isEmail = function (email) {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};

validate.isAddress = function (add) {
	var re = /^([^\x00-\x7F]|[a-zA-Z])+\s\d+$/;
    return re.test(add);
};

validate.isName = function (name) {
	if( name.length < 3 ){
		return false ;
	}
  return true;
};

validate.isSelected = function (value) {
	if( value === '' ){
		return false ;
	}
  return true;
};

function phonecheck(a){
	var re = /^[4-8]/;
	return re.test(a);
}

function letterCheck(num){

	if (/([^\x00-\x7F]|[a-zA-Z])/.test(num)) {
		return false;
	}
	return true;
}


module.exports = validate;