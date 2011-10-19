class UrlMappings {

	static mappings = {

        "/$regionType/$regionName?" (controller: 'regions', action: 'region') {
            constraints {
                regionType(inList:['states','lgas','ibras','imcras','nrms','layer'])
            }
        }
        
		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

		"/"(view:"/index")
		"500"(view:'/error')
	}
}
