var async = require('async');

/**
 * Creates a new limited-queue instance
 * @param worker function, that will be executed with each pushed data (see async queue)
 * @param concurrency see async queue concurrency
 * @param maxTaskCount Number of tasks that will be pushed to the queue
 */
function createQueue (worker, concurrency, maxTaskCount) {

    if (maxTaskCount === undefined) {
        // concurrency can be ommitted
        maxTaskCount = concurrency;
    }

    var currentCount = 0; // counts how many tasks were pushed to the queue

    var queue = async.queue(function(data, callback) {
        worker.call({}, data, callback, currentCount); // currentCount is passed as additional argument to the worker
    }, concurrency);

    var origPush = queue.push;
    queue.push = function(data, callback) {
        var nextCount = currentCount + 1;
        if (nextCount > maxTaskCount) { // only allow up to maxTaskCount tasks in the queue
            if (callback) {
                callback("Cannot save data because currentTaskCount " + nextCount + " > maxTaskCount " + maxTaskCount);
            }
            return;
        }
        currentCount = nextCount;
        origPush(data, callback); // push to queue / worker
    };

    queue.finaldrain = undefined; // callback when the queue is empty after the maximum number of tasks was executed
    var drain; // stores the drain callback that is executed everytime the queue is empty
    var queueDrain = function () {
        if (drain) {
            drain(currentCount);
        }
        if (currentCount >= maxTaskCount && queue.finaldrain) {
            queue.finaldrain(currentCount);
        }
    };
    queue.drain = queueDrain;

    // make sure the queue.drain that was defined above will not be overwritten
    Object.defineProperty(queue, "drain", {
        set: function (newDrain) {
            drain = newDrain;
        },
        get: function() {
            return queueDrain;
        }
    });

    // getter-variable for the number of tasks that were already pushed to the queue
    queue.currentTaskCount = undefined;
    Object.defineProperty(queue, "currentTaskCount", {
        get: function () {
            return currentCount;
        }
    });

    return queue;
}

module.exports = {
    queue : createQueue
};