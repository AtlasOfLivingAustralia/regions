package au.org.ala.regions

/**
 * Habitats tag lib, for rendering tree explorer.
 *
 */
class HabitatsTagLib {

    static namespace = 'hab'

    def metadataService

    private def outputNode(out, node, isRoot){

      def rootNodeClass =  isRoot ? 'habitatRootNote': ''

      out << "<li class='habitatNode ${rootNodeClass}' data-id='${node.guid}' data-rasterid='${node.rasterID}' data-pid='${node.pid}' data-name='${node.name}'>"

      out << node.name

      if(node.children){
        out << "<ul class='subTree hide'>"
        node.children.each { guid, childNode -> outputNode(out, childNode, false) }
        out << "</ul>"
      }

      out << "</li>"
    }

    /**
     *
     * @attr guid REQUIRED
     * @attr regionFid REQUIRED
     * @attr regionType REQUIRED
     * @attr regionName REQUIRED
     * @attr from REQUIRED
     * @attr to REQUIRED
     */
    def habitatTree = {
        def config = metadataService.getHabitatConfig()
        out << "<ul id='habitatTree'>"
        config.tree.each { guid, node -> outputNode(out , node, true) }
        out << "</ul>"
    }
}
