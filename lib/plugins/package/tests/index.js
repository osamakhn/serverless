'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const BbPromise = require('bluebird');
const Package = require('../index');
const Serverless = require('../../../../lib/Serverless');

describe('#constructor()', () => {
  let serverless;
  let packageService;

  beforeEach(() => {
    serverless = new Serverless();
    serverless.init();
    packageService = new Package(serverless);
  });

  it('should have hooks', () => expect(packageService.hooks).to.be.not.empty);

  it('should run promise chain in order for "deploy:createDeploymentArtifacts" hook', () => {
    const validateStub = sinon
      .stub(packageService, 'validate').returns(BbPromise.resolve());
    const zipServiceStub = sinon
      .stub(packageService, 'zipService').returns(BbPromise.resolve());

    return packageService.hooks['deploy:createDeploymentArtifacts']().then(() => {
      expect(validateStub.calledOnce).to.be.equal(true);
      expect(zipServiceStub.calledAfter(validateStub)).to.be.equal(true);

      packageService.validate.restore();
      packageService.zipService.restore();
    });
  });

  it('should run promise chain in order for "deploy:cleanup" hook', () => {
    const cleanupStub = sinon
      .stub(packageService, 'cleanup').returns(BbPromise.resolve());

    return packageService.hooks['deploy:cleanup']().then(() => {
      expect(cleanupStub.calledOnce).to.be.equal(true);

      packageService.cleanup.restore();
    });
  });
});
