# limited-queue

Limited queue provides an augmented version of [async.queue](https://github.com/caolan/async/blob/master/README.md#queue).
A limited queue has a specified maximum number of tasks it accepts and processes. An optional callback is executed after the last of the tasks was completed.
Everything else works like [async.queue](https://github.com/caolan/async/blob/master/README.md#queue).

## Usage

The syntax to create a limited-queue: `queue(worker, [concurrency], maxTaskCount)`

__Arguments__
* `worker(task, callback, currentTaskCount)`: The worker that processes the tasks that are pushed to the queue (see [async.queue](https://github.com/caolan/async/blob/master/README.md#queue)).
  The additional parameter `currentTaskCount` is an Integer containing the number of tasks that were already completed by the queue.
* `concurrency`: The number of tasks that may be processed in parallel (see [async.queue](https://github.com/caolan/async/blob/master/README.md#queue)). Can be omitted.
* `maxTaskCount`: The maximum number of tasks the queue accepts. Any tasks that will be pushed to the queue after this threshold is reached will not be processed. 
  Instead, the tasks callback method will be called with an error message as first argument. Failed tasks will also count as completed tasks.

__Queue objects (in addition to async.queue)__
* `finaldrain(currentTaskCount)`: A callback that will be called once after the specified maxTaskCount was reached, and all tasks were completed. The parameter `currentTaskCount` provides the number of tasks that were completed. 
  It will be equal to the `maxTaskCount` if all tasks complete successfully.
* `currentTaskCount`: An Integer to determine how many tasks were completed yet. 

__Example__

```
var limitedQueue = require('limited-queue');

function worker(data, callback) {
    console.log(data);
    callback();
}
var concurrency = 5;
var maxTaskCount = 2;

var queue = limitedQueue.queue(worker, concurrency, maxTaskCount);

queue.finaldrain = function(taskCount) {
  console.log(taskCount+" tasks completed");
}

queue.push("data1"); // push first task to worker
queue.push("data2"); // push second task to worker, will trigger `finaldrain` after completion because `maxTaskCount` is 2
queue.push("data3"); // will not bee pushed to the worker because `maxTaskCount` is 2
```
