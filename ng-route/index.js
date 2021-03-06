/**
@todo
- remove the need to check this.subGenerator in EVERY function (i.e. find a way to NOT call this generator AT ALL if subGenerator is wrong, but hookFor doesn't seem to be able to be conditionally called based on prompts..?)

NOTE: uses Yeoman this.spawnCommand call to run commands (since need to handle Windows/different operating systems and can't use 'exec' since that doesn't show (live) output)
*/

'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');

var NgRouteGenerator = module.exports = function NgRouteGenerator(args, options, config) {
	// By calling `NamedBase` here, we get the argument to the subgenerator call
	// as `this.name`.
	yeoman.generators.NamedBase.apply(this, arguments);

	//copy over prompt options to 'this' scope for templating
	var xx;
	for(xx in this.options.props) {
		this[xx] =this.options.props[xx];
		// console.log(xx+': '+this[xx]);
	}
};

util.inherits(NgRouteGenerator, yeoman.generators.NamedBase);

NgRouteGenerator.prototype.askFor = function askFor() {
if(this.subGenerator =='ng-route') {
	var cb = this.async();
	
	var prompts = [
		{
			name: 'routeName',
			message: 'Route name (i.e. my-page)'
		},
		{
			type: 'list',
			name: 'skipGrunt',
			message: 'Skip running Grunt (you will have to run yourself after Yeoman completes)?',
			choices: [
				'0',
				'1'
			],
			default: '0'
		}
	];
	
	this.prompt(prompts, function (props) {
		var ii, jj, kk, skip, curName;
		var skipKeys =[];
		var toInt =['skipGrunt'];
		for(ii =0; ii<prompts.length; ii++) {
			curName =prompts[ii].name;
			skip =false;
			for(jj =0; jj<skipKeys.length; jj++) {
				if(curName ==skipKeys[jj]) {
					skip =true;
					break;
				}
			}
			if(!skip) {		//copy over
				//convert to integer (from string) if necessary
				for(kk =0; kk<toInt.length; kk++) {
					if(curName ==toInt[kk]) {
						props[curName] =parseInt(props[curName], 10);
					}
				}
				
				this.options.props[curName] =this[curName] =props[curName];
			}
		}
		
		//handle some special ones (the skipKeys from above)
		// this.options.props.appKeywords =this.appKeywords = props.appKeywords.split(' ');
		
		//add some
		this.options.props.routeNameCtrl =this.routeNameCtrl = this._.capitalize(this._.camelize(this.routeName))+'Ctrl';
		
		cb();
	}.bind(this));
}
};

NgRouteGenerator.prototype.files = function files() {
if(this.subGenerator =='ng-route') {

	var pagePath ='app/src/modules/pages/'+this.routeName;
	//A. make all directories (do it at top so they're all created since templated files are collected here at the top)
	this.mkdir(pagePath);
	
	
	//B. template files (all templated files TOGETHER here)
	this.template('new-page/_new-page.html', pagePath+'/'+this.routeName+'.html');
	this.template('new-page/_new-page.less', pagePath+'/'+this.routeName+'.less');
	this.template('new-page/_NewPageCtrl.js', pagePath+'/'+this.routeNameCtrl+'.js');
	this.template('new-page/_NewPageCtrl.spec.js', pagePath+'/'+this.routeNameCtrl+'.spec.js');
	
	
	//C. copy files & directories
	//NOTE: leading with just a '.' sometimes doesn't copy over properly / gives error so add the '_' even though not templating
	
}
};

NgRouteGenerator.prototype.updateBuildfiles = function updateBuildfiles() {
if(this.subGenerator =='ng-route') {
	var path ='app/src/config/buildfilesModules.json';
	var bfObj = JSON.parse(this.readFileAsString(path));
	var ii, jj, found =false, modulesIndex =false, pagesIndex =false;
	for(ii =0; ii<bfObj.dirs.length; ii++) {
		if(bfObj.dirs[ii].name =='modules') {
			modulesIndex =ii;
			for(jj =0; jj<bfObj.dirs[ii].dirs.length; jj++) {
				if(bfObj.dirs[ii].dirs[jj].name =='pages') {
					bfObj.dirs[ii].dirs[jj].dirs.push(
						{
							"name":this.routeName,
							"files": {
								"html":[this.routeName+'.html'],
								"less":[this.routeName+'.less'],
								"js":[this.routeNameCtrl+'.js'],
							}
						}
					);
					found =true;
					break;
				}
			}
			if(found) {
				break;
			}
		}
	}
	
	//write new object back to file
	this.write(path, JSON.stringify(bfObj, null, '\t'));		//make sure to use the 3rd parameter to make the output JSON formatted (a tab character in this case)! - http://stackoverflow.com/questions/5670752/write-pretty-json-to-file-using-node-js
	
}
};

NgRouteGenerator.prototype.updateAppJs = function updateAppJs() {
if(this.subGenerator =='ng-route') {
	var path ='app/src/common/js/app.js';
	// var contents =this.read(path);
	var contents =this.readFileAsString(path);
	var indexStart =contents.indexOf('//end: yeoman generated routes here');
	if(indexStart >-1) {
		// var indexEnd =contents.indexOf('/n', indexStart);
		// console.log(indexStart+' '+indexEnd);
		// if(indexEnd >-1) {
		if(1) {
			var newData ="$routeProvider.when(appPathRoute+'"+this.routeName+"', {templateUrl: pagesPath+'"+this.routeName+"/"+this.routeName+".html',\n"+
			"		resolve: {\n"+
			"			auth: function(svcAuth) {\n"+
			"				return svcAuth.checkSess({noLoginRequired:true});\n"+
			"			}\n"+
			"		}\n"+
			"	});\n";
			// var newContents =contents.slice(0, (indexEnd+1))+newData+contents.slice((indexEnd+1), contents.length);
			var newContents =contents.slice(0, (indexStart))+newData+contents.slice((indexStart), contents.length);
			this.write(path, newContents);
		}
	}
}
};

NgRouteGenerator.prototype.commandsGrunt = function commandsGrunt() {
if(this.subGenerator =='ng-route') {
	var cb = this.async();
	var self =this;
	
	if(this.skipGrunt ===undefined || !this.skipGrunt) {
		var command ='grunt';
		var args =['q'];
		var cmd =this.spawnCommand(command, args);
		cmd.on('exit', function(code) {
			self.log.writeln('child process exited with code: '+code);
			self.log.writeln("command run and done: "+command+" args: "+args);
			cb();
		});
	}
	else {
		cb();
	}
}
};

NgRouteGenerator.prototype.logNextSteps = function logNextSteps() {
if(this.subGenerator =='ng-route') {
	this.log.writeln('Next steps:\n1. IF you want to make a custom nav (header and/or footer) for this page, add it in `modules/services/nav/nav.js`\n2. Edit the files (html, less, js) for your new page!');
}
};