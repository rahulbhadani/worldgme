/*globals define*/
/*eslint-env node, browser*/

/**
 * Generated by PluginGenerator 2.20.5 from webgme on Tue Jun 18 2019 16:55:53 GMT-0700 (Pacific Daylight Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of ModelicaCodeGenerator2.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ModelicaCodeGenerator2.
     * @constructor
     */
    function ModelicaCodeGenerator2() {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructure etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    ModelicaCodeGenerator2.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    ModelicaCodeGenerator2.prototype = Object.create(PluginBase.prototype);
    ModelicaCodeGenerator2.prototype.constructor = ModelicaCodeGenerator2;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(Error|null, plugin.PluginResult)} callback - the result callback
     */
    ModelicaCodeGenerator2.prototype.main = function (callback) {
        // Use this to access core, project, result, logger etc from PluginBase.
        var self = this,
            core = this.core,
            logger = this.logger,
            modelJson = {
                name: '',
                components: [],
                connections: []
                },
            activeNode = this.activeNode;
        
        function atComponent(node){
            var componentData = {
                URI: '',
                name: '',
                parameters: {}
            };

            // We wantthe name of the model.
            componentData.URI = core.getAttribute(node, 'ModelicaURI');
            componentData.name = core.getAttribute(node, 'name');
        
            modelJson.components.push(componentData);
        
        }

        function atConnection(nodes, node){
            var connData = {
                src: '',
                dst: ''
            };
        
        
            var srcPath = core.getPointerPath(node, 'src');
            var dstPath = core.getPointerPath(node, 'dst');
        
            if(srcPath && dstPath){
                var srcNode = nodes[srcPath];
                var dstNode = nodes[dstPath];
            
                var srcParent = core.getParent(srcNode);
                var dstParent = core.getParent(dstNode);
            
                connData.src = core.getAttribute(srcParent, 'name') + '.' + core.getAttribute(srcNode, 'name');
                connData.dst = core.getAttribute(dstParent, 'name') + '.' + core.getAttribute(dstNode, 'name');
            
                modelJson.connections.push(connData);
            }
        
        }
        
        function getMoFileContent(){
            var moFile = 'model ' + modelJson.name;

            modelJson.components.forEach(function (data){
                moFile += '\n ' + data.URI + ' ' +data.name + ';';
            });
        
            moFile += '\nequation';
        
            modelJson.connections.forEach(function(data){
                moFile += '\n connect(' + data.src + ', ' + data.dst + ');';
            });
        
            moFile += '\nend ' + modelJson.name + ';';
            
            logger.info(moFile);
            
            return moFile;
        }

        // This will save the changes. If you don't want to save;
        // exclude self.save and call callback directly from this scope.
        self.loadNodeMap(this.activeNode)
            .then(function(nodes) {
                var nodePath, 
                    node;
                for(nodePath in nodes){
                    self.logger.info(self.core.getAttribute(nodes[nodePath], 'name'), 'has path', nodePath);
                }

                modelJson.name = core.getAttribute(activeNode, 'name');

                var childrenPaths = core.getChildrenPaths(activeNode);

                for(var i = 0;  i < childrenPaths.length; i += 1){
                    node = nodes[childrenPaths[i]];
                    if(self.isMetaTypeOf(node, self.META.Component)){
                        atComponent(node);
                    }else if (self.isMetaTypeOf(node, self.META.Connection)){
                        atConnection(nodes, node);
                    }
                }

                self.logger.info('Extracted data:\n', JSON.stringify(modelJson, null, 2));
                
                var moFileContent = getMoFileContent();
                
                return self.blobClient.putFile(modelJson.name + '.mo', moFileContent);
            })
            .then(function (metadataHash){
            self.result.addArtifact(metadataHash);
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function(err){
                // Result success is false at invocation.
                self.logger.error(err.stack);
                callback(err, self.result);
            });
    };

    return ModelicaCodeGenerator2;
});
