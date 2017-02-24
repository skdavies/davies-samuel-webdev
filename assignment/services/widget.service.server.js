module.exports = function (app) {
  var widgets = [
    { "_id": "123", "widgetType": "HEADER", "pageId": "321", "size": 2, "text": "GIZMODO"},
    { "_id": "234", "widgetType": "HEADER", "pageId": "321", "size": 4, "text": "Lorem ipsum"},
    { "_id": "345", "widgetType": "IMAGE", "pageId": "321", "width": "100%",
      "url": "http://lorempixel.com/400/200/"},
    { "_id": "456", "widgetType": "HTML", "pageId": "321", "text": "<p>Lorem ipsum</p>"},
    { "_id": "567", "widgetType": "HEADER", "pageId": "321", "size": 4, "text": "Lorem ipsum"},
    { "_id": "678", "widgetType": "YOUTUBE", "pageId": "321", "width": "100%",
      "url": "https://youtu.be/AM2Ivdi9c4E" },
    { "_id": "789", "widgetType": "HTML", "pageId": "321", "text": "<p>Lorem ipsum</p>"}
  ];

  app.post('/api/page/:pageId/widget', createWidget);
  app.get('/api/page/:pageId/widget', findAllWidgetsForPage);
  app.get('/api/widget/:widgetId', findWidgetById);
  app.put('/api/widget/:widgetId', updateWidget);
  app.delete('/api/widget/:widgetId', deleteWidget);
  app.put('/api/page/:pageId/widget', reorderWidget);

  function createWidget(req, res) {
    var widget = req.body;
    if (widget) {
      widget._id = (parseInt(widgets[widgets.length - 1]._id) + 1).toString();
      widget.pageId = req.params.pageId;
      widgets.push(widget);
      res.json(widget);
    } else {
      res.status(400).send('Empty request body is invalid.');
    }
  }

  function findAllWidgetsForPage(req, res) {
    var pageWidgets = [];
    for (var i = 0; i < widgets.length; i++) {
      if (widgets[i].pageId === req.params.pageId) {
        pageWidgets.push(widgets[i]);
      }
    }
    res.json(pageWidgets);
  }

  function findWidgetById(req, res) {
    for (var i = 0; i < widgets.length; i++) {
      if (widgets[i]._id === req.params.widgetId) {
        res.json(widgets[i]);
        return;
      }
    }
    res.status(404).send('Widget with that ID does not exist.');
  }

  function updateWidget(req, res) {
    if (req.body) {
      for (var i = 0; i < widgets.length; i++) {
        if (widgets[i]._id === req.params.widgetId) {
          widgets[i] = req.body;
          res.sendStatus(200);
          return;
        }
      }
      res.status(404).send('Widget does not exist.');
    } else {
      res.status(400).send('Empty request body is invalid.');
    }
  }

  function deleteWidget(req, res) {
    for (var i = 0; i < widgets.length; i++) {
      if (widgets[i]._id === req.params.widgetId) {
        widgets.splice(i, 1);
        res.sendStatus(200);
        return;
      }
    }
    res.status(404).send('Widget does not exist.');
  }

  // Written to work once there are widgets that aren't all on the same page stored
  function reorderWidget(req, res) {
    var initial = parseInt(req.query.initial);
    var final = parseInt(req.query.final);
    if (!isNaN(initial) && !isNaN(final)) {
      try {
        var count = 0;
        var widget = {};
        var up = initial > final;
        for (var i = 0; i < widgets.length; i++) {
          if (widgets[i].pageId === req.params.pageId) {
            if (count === initial) {
              widget = widgets[i];
              break;
            }
            count += 1;
          }
        }
        count = 0;
        for (var j = 0; j < widgets.length; j++) {
          if (widgets[j].pageId === req.params.pageId) {
            if (count === final) {
              if (up) {
                widgets.splice(j, 0, widget);
              } else {
                widgets.splice(j + 1, 0, widget);
              }
              break;
            }
            count += 1;
          }
        }
        if (up) { // moving up
          widgets.splice(initial + 1, 1);
        } else { // moving down
          widgets.splice(initial, 1);
        }
        res.sendStatus(200);
      } catch(error) {
        res.status(400).send('Initial and final indices are out of range');
      }
    } else {
      res.status(400).send('Initial and final indices must be provided');
    }
  }
};