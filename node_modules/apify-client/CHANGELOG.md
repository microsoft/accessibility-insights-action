0.6.0 / 2019/12/05
===================
- Removed legacy Apify Crawler methods that are no longer supported by Apify API.

0.5.26 / 2019/07/24
===================
- Added update method for request queues, datasets and key-value stores.

0.5.23 / 2019/07/24
===================
- Added new method `client.acts.resurrectRun()` that resurrects finished (even failed) actor run.

0.5.20 / 2019/06/18
===================
- `body` and `contentType` parameters of `client.tasks.runTask()` were deprecated in favor of new `input` parameter.
- Added new methods to get and update input of actor task - `client.tasks.getInput()` and `client.tasks.updateInput()`.

0.5.19 / 2019/05/28
===================
- Added `simplified` and `skipFailedPages` parameters to `datasets.getItems()`
  to support legacy crawler produced datasets.

0.5.18 / 2019/05/21
===================
- Added parameter retryOnStatusCodes to define an array of HTTP status codes on which
  client retries the request. Default value is `[429]` (only rate limit exceeded).

0.5.17 / 2019/05/14
===================
- Fix of non-JSON crawler execution results retrieval

0.5.15 / 2019/04/25
===================
- Added support for clientKey parameter to request queue endpoints.

0.5.13 / 2019/04/15
===================
- Fixed a bug where last retry stats would not be saved correctly.

0.5.11 / 2019/04/04
===================
- Client now retries request in a case of an invalid JSON response (incomplete response payload).

0.5.10 / 2019/03/21
===================
- `apifyClient.stats.rateLimitErrors` is now an `Array` and tracks errors per retry count.

0.5.9 / 2019/03/15
==================
- Added `client.tasks.listWebhooks()` to list task webhooks.

0.5.8 / 2019/03/14
==================
- Added `client.webhooks` providing access to Apify webhooks.
- Added `client.webhookDispatches` providing access to Apify webhook dispatches.
- Added `client.acts.listWebhooks()` to list actor webhooks.

0.5.7 / 2019/03/01
==================
- Added exponential backoff to `datasets.getItems()` in a case of "Unexpected end of JSON input" error

0.5.6 / 2019/02/26
==================
- Added more details to `ApifyClientError` for easier debugging
- Added `client.acts.metamorphRun()`, see documentation for more information.

0.5.5 / 2019/01/24
==================
- Improve `.toString()` message of `ApifyClientError`.

0.5.4 / 2019/01/15
==================
- Added `clean`, `skipHidden` and `skipEmpty` parameters to `client.datasets.getItems()` method.

0.5.3 / 2018/12/31
==================
- Increased number of retries for request queue endpoints that may be slower to scale up.

0.5.2 / 2018/12/05
==================
- Fixed getActorVersion method, now returns `null` if version does not exist

0.5.1 / 2018/11/27
==================
- Added `ApifyClient.stats` object that collects various statistics of the API client

0.5.0 / 2018/11/21
==================
- Methods for Apify storages (i.e. key-value stores, datasets and request queues) that use other than GET HTTP method
  now require token parameter.
- `tasks.runTask()` method now allows to overload input and options from actor task configuration.

0.4.0 / 2018/11/06
==================
- All key-value store records with content type `text/*` are now parsed into string.
- Option `promise` to customize Promise implementation is not supported any more.
- All methods now use native promises instead of Bluebird implementation. Make sure that your code doesn't depend on Bluebird.
- All Boolean parameters of v2 endpoints (Actor, Storages) are now truly Boolean and don't accept `1` as `true`.
  Legacy crawler API hasn't changed.
- Added support for actor versions API.
- Endpoint to get items from dataset now passes `encoding: null` to support XSLX format.

0.3.4 / 2018/10/31
==================
- Added support for actor tasks API.

0.3.3 / 2018/10/25
==================
- Requests repeated more than `expBackOffMaxRepeats/2` times are logged.

0.3.1 / 2018-08-06
===================
- Added `client.tasks` providing access to Apify tasks.

0.3.0 / 2018-08-06
===================
- Upgraded NPM dependencies
- Renamed `ApifyError` to `ApifyClientError`

0.2.13 / 2018-08-06
===================
- Added support for more content types to `utils.parseBody()`.

0.2.12 / 2018-08-01
===================
- Added support for pre-serialized data (strings) to `Apify.datasets.putItems()`.

0.2.10 / 2018-05-23
===================
- Added `executionId` parameter to getCrawlerSettings method. You can get crawler settings for specific execution with that.

0.2.9 / 2018-05-10
==================
- Thrown error in a case of failed request now contains details such as `URL`, `method`, ... .

0.2.8 / 2018-04-42
==================
- All date fields (ending with `At`) such as `modifiedAt`, `createdAt`, etc. are now parsed to `Date` object.

0.2.7 / 2018-04-03
==================
- Added `client.requestQueues` providing access to Apify Request Queue.
- RequestQueue / KeyValueStore / Dataset now support `[username]~[store-name]` instead of store ID.

0.2.6 / 2018-03-26
==================
- Added `client.users.getUser()` method that retrieves own accout details including usage and limits.

0.2.0 / 2018-03-09
==================
- WARNING: Method `datasets.getItems()` now returns object PaginationList with items wrapped inside instead of plain items array. This helps to iterate through all the items using pagination. This change is not backward compatible!

0.1.69 / 2018-02-08
===================
- Support for Function type added to `utils.checkParamOrThrow()`

0.1.68 / 2018-02-05
===================
- Updated GitHub repo and Travis CI links

0.1.65 / 2018-01-31
===================
- Datasets group addded
