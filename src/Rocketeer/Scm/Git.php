<?php
namespace Rocketeer\Scm;

use Illuminate\Container\Container;

/**
 * The Git SCM
 */
class Git implements Scm
{

	/**
	 * The IoC Container
	 *
	 * @var Container
	 */
	protected $app;

	/**
	 * Build a new Git instance
	 *
	 * @param Container $app
	 */
	public function __construct($app)
	{
		$this->app = $app;
	}

	////////////////////////////////////////////////////////////////////
	///////////////////////////// INFORMATIONS /////////////////////////
	////////////////////////////////////////////////////////////////////

	/**
	 * Get the current state of the repository
	 *
	 * @return string
	 */
	public function current()
	{
		return 'git rev-parse HEAD';
	}

	////////////////////////////////////////////////////////////////////
	/////////////////////////////// ACTIONS ////////////////////////////
	////////////////////////////////////////////////////////////////////

	/**
	 * Clone a repository
	 *
	 * @param  string $destination
	 *
	 * @return string
	 */
	public function checkout($destination)
	{
		$branch     = $this->app['rocketeer.rocketeer']->getRepositoryBranch();
		$repository = $this->app['rocketeer.rocketeer']->getRepository();

		return sprintf('git clone -b %s %s %s', $branch, $repository, $destination);
	}

	/**
	 * Resets the repository
	 *
	 * @return string
	 */
	public function reset()
	{
		return 'git reset --hard';
	}

	/**
	 * Updates the repository
	 *
	 * @return string
	 */
	public function update()
	{
		return 'git pull';
	}

}