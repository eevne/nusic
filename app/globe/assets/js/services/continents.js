angular.module('nusic.app.globe').service('continents',function(){
    this.getContinents = function() { return {
        "children": [ {
            "children": [ {
                "attributes": {
                    "Vertex": {
                        "itemSize": 3,
                        "type": "ARRAY_BUFFER"
                    }
                },
                "name": "",
                "primitives": [ {
                    "count": 64380,
                    "first": 0,
                    "mode": "TRIANGLES"
                }
                ]
            }
            ],
            "name": "lands_final.osg",
            "stateset": {
                "material": {
                    "ambient": [ 0.2, 0.2, 0.2, 1],
                    "diffuse": [ 0.840188, 0.394383, 0.783099, 1],
                    "emission": [ 0, 0, 0, 1],
                    "name": "",
                    "shininess": 0,
                    "specular": [ 0, 0, 0, 1]
                }
            }
        }
        ]
    }; }

});