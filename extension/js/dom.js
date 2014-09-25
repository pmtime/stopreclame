var DOM = {
    id: function (id) {
        return document.getElementById(id);
    },

    create: function (tag_name) {
        if (!tag_name || typeof tag_name !== "string") {
            tag_name = "div";
        }

        return document.createElement(tag_name);
    },

    remove: function (node) {
        if (!node) {
            return true;
        }

        try {
            node.parentNode.removeChild(node);
        } catch (e) {
            return false;
        }

        return true;
    }
};