<!DOCTYPE html>
<html>
<head>
  <% include ../../../partials/header.ejs %>
  <title><%= process.env.TITLE %> - <%= notificationGroup.name %></title>
</head>

<body style="text-align:center;">

  <% include ../../../partials/pre-nav.ejs %>
    <li><a href='/developer'>Developer Dashboard</a></li>
    <% if (organisation.image) { %>
      <li><a class='no-padding' href='/organisation/<%= notificationGroup.organisation._id %>'><img style="height:50px;" src='/image/<%= notificationGroup.organisation.image.path %>'></a></li>
    <% } else { %>
      <li><a href='/organisation/<%= notificationGroup.organisation._id %>'><%= notificationGroup.organisation.name %></a></li>
    <% } %>
  <% include ../../../partials/post-nav.ejs %>

  <div class="card bordered shadowed"
    <%= notificationGroup %>
  </div>

</body>
</html>
