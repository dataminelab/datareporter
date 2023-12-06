import moment from "moment";
import { isFunction } from "lodash";

// Ensure that this image will be available in assets folder
import "@/assets/images/avatar.svg";

// Register visualizations
import "@redash/viz/lib";

// Register routes before registering extensions as they may want to override some https://staging-app.datareporter.com/reports/new#demo.orders/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvgg/GrC5PYAJgD6kegUqr5kAAqOWJEuoJEwDuhYuATJAIwAmlZQ9sL4ALRFqp7eQvYVIEoAuipuDcEVDhCc/oHB/AiYDlZwvIwFIP1WYIgwZC7YMIJt1NiYaPhoDkvt1FDhEGiZhN0Evf0cVpFJ2FD5wwJj5WM7eKABQQSnZGposI+rwEhcvD00ss7hAAlNngRIstQdh7gNqF4+phIsFWtQkGpTvgAKwABk64O86jB9w0jwRIQC8RicXsVg4uVWQj6HmCyQAzABZd4OT7fIYEXhMqKxeJWDwQxEPJ44GFw6bBOBQFFo24qEAEol4LkIQ4gMR9aF4VwgH6OMjYUHBf6A4EQJ3UORjNToHiU4JIhRrHbUBYIJa4/UK7waLU5CgUu0BR3eF3RACOvM93t9X39iMCcGD80W3jx+ZAsdgAVaGxAwn62DIkQAIsr8i46w3sE3IkwPs77K6QQmgA
import "@/pages";

import "./antd-spinner";

moment.updateLocale("en", {
  relativeTime: {
    future: "%s",
    past: "%s",
    s: "just now",
    m: "a minute ago",
    mm: "%d minutes ago",
    h: "an hour ago",
    hh: "%d hours ago",
    d: "a day ago",
    dd: "%d days ago",
    M: "a month ago",
    MM: "%d months ago",
    y: "a year ago",
    yy: "%d years ago",
  },
});

function requireImages() {
  // client/app/assets/images/<path> => /images/<path>
  const ctx = require.context("@/assets/images/", true, /\.(png|jpe?g|gif|svg)$/);
  ctx.keys().forEach(ctx);
}

function registerExtensions() {
  const context = require.context("extensions", true, /^((?![\\/.]test[\\./]).)*\.jsx?$/);
  const modules = context
    .keys()
    .map(context)
    .map(module => module.default);

  return modules
    .filter(isFunction)
    .filter(f => f.init)
    .map(f => f());
}

requireImages();
registerExtensions();
