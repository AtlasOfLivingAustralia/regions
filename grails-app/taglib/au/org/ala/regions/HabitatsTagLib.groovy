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

        if (node.children?.size()) {
            out << "<i class='fa fa-chevron-right'></i>"
            out << "<i class='fa fa-chevron-down' style='display:none'></i>"
        } else {
            out << "<i class='fa fa-circle'></i>"
        }

        out << node.name

      if(node.children){
          out << "<ul class='subTree' style='display:none' >"
        node.children.each { guid, childNode -> outputNode(out, childNode, false) }
        out << "</ul>"
      }

      out << "</li>"
    }

    def habitatTree = {
        def config = metadataService.getHabitatConfig()
        out << "<ul id='habitatTree'>"
        config.tree.each { guid, node -> outputNode(out , node, true) }
        out << "</ul>"
    }
}
