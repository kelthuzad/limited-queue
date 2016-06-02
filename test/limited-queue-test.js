/**
 * Tests for limited-queue
 */
var expect = require("chai").expect;
var limitedQueue = require("../limited-queue");

describe("Tests limited-queue", function() {

    it("currentCount works", function() {
        var numberOfJobs = 2;
        var queueFunction = function(data, callback) {
            callback();
        };

        var queue = limitedQueue.queue(queueFunction, numberOfJobs);
        expect(queue.currentTaskCount).to.equal(0);
        queue.push({});
        expect(queue.currentTaskCount).to.equal(1);
        queue.push({});
        expect(queue.currentTaskCount).to.equal(2);
        queue.push({});
        expect(queue.currentTaskCount).to.equal(2);
    });

    it("push to queue works", function(done) {
        var numberOfJobs = 3;

        var expected = [
            {"data": 'data'},
            {"data2": 'data2'},
            {"data3": 'data3'}
        ];
        var pushCount = 0;

        var queueFunction = function(data, callback) {
            expect(data).to.deep.equal(expected[pushCount]);
            pushCount++;
            if (pushCount === expected.length) {
                done();
            }
            callback();
        };

        var queue = limitedQueue.queue(queueFunction, numberOfJobs);
        queue.push({"data": 'data'});
        queue.push({"data2": 'data2'});
        queue.push({"data3": 'data3'});
    });

    it("queue push callback works", function(done) {
        var numberOfJobs = 1;
        var queueFunction = function(data, callback) {
            callback();
        };

        var queue = limitedQueue.queue(queueFunction, numberOfJobs);
        queue.push({"data": 'data'}, function(err, data){
            expect(err).to.equal(undefined);
            expect(data).to.equal(undefined);
        });
        queue.push({"data": 'data2'}, function(err, data) {
            expect(err).to.equal("Cannot save data because currentTaskCount 2 > maxTaskCount 1");
            expect(data).to.equal(undefined);
            done();
        });
    });

    it("queue finished callback works", function(done) {
        var numberOfJobs = 2;
        var numberOfCallbacks = 0;
        var queueFunction = function(data, callback) {
            callback();
        };
        var queueFinishedCallback = function() {
            expect(queue.currentTaskCount).to.equal(2);
            numberOfCallbacks++;
            expect(numberOfCallbacks).to.equal(1);
            done();
        };

        var queue = limitedQueue.queue(queueFunction, numberOfJobs);
        queue.finaldrain = queueFinishedCallback;
        queue.push({"data": 'data'});
        queue.push({"data": 'data2'});
    });

    it("queue drained callback works", function(done) {

        var numberOfJobs = 2;
        var queueFunction = function(data, callback) {
            callback();
        };
        var drainFunction = function() {
            done();
        };

        var queue = limitedQueue.queue(queueFunction, numberOfJobs);
        queue.drain = drainFunction;
        queue.push({});
    });
});
