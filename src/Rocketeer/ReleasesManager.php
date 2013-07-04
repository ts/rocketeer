<?php
namespace Rocketeer;

use Illuminate\Container\Container;
use Illuminate\Support\Str;

/**
 * Handles the managing and cleaning of releases
 */
class ReleasesManager
{

	/**
	 * The IoC Container
	 *
	 * @var Container
	 */
	protected $app;

	/**
	 * Build a new ReleasesManager
	 *
	 * @param Container $app
	 */
	public function __construct(Container $app)
	{
		$this->app = $app;
	}

	////////////////////////////////////////////////////////////////////
	/////////////////////////////// RELEASES ///////////////////////////
	////////////////////////////////////////////////////////////////////

	/**
	 * Get all the releases on the server
	 *
	 * @return array
	 */
	public function getReleases()
	{
		$releases = null;

		// Get releases on server
		$this->app['remote']->run(array(
			'ls '.$this->getReleasesPath(),
		), function($release) use (&$releases) {
			$releases .= $release;
		});

		// Transform to array
		$endings  = Str::contains("\r\n", $releases) ? "\r\n" : "\n";
		$releases = explode($endings, $releases);

		// Filter and sort
		$releases = array_filter($releases);
		rsort($releases);

		return $releases;
	}

	/**
	 * Get an array of deprecated releases
	 *
	 * @return array
	 */
	public function getDeprecatedReleases()
	{
		$releases    = $this->getReleases();
		$maxReleases = $this->app['config']->get('rocketeer::remote.keep_releases');

		return array_slice($releases, $maxReleases);
	}

	////////////////////////////////////////////////////////////////////
	////////////////////////////// PATHS ///////////////////////////////
	////////////////////////////////////////////////////////////////////

	/**
	 * Get the path to the releases folder
	 *
	 * @return string
	 */
	public function getReleasesPath()
	{
		return $this->app['rocketeer.rocketeer']->getFolder('releases');
	}

	/**
	 * Get the path to a release
	 *
	 * @param  integer $release
	 *
	 * @return string
	 */
	public function getPathToRelease($release)
	{
		return $this->getReleasesPath().'/'.$release;
	}

	/**
	 * Get the path to the current release
	 *
	 * @return string
	 */
	public function getCurrentReleasePath()
	{
		return $this->getPathToRelease($this->getCurrentRelease());
	}

	////////////////////////////////////////////////////////////////////
	/////////////////////////// CURRENT RELEASE ////////////////////////
	////////////////////////////////////////////////////////////////////

	/**
	 * Get the current release
	 *
	 * @return string
	 */
	public function getCurrentRelease()
	{
		return $this->app['rocketeer.deployments']->getValue('current_release');
	}

	/**
	 * Get the release before the current one
	 *
	 * @return string
	 */
	public function getPreviousRelease()
	{
		// Get all releases and the current one
		$releases = $this->getReleases();
		$current  = $this->getCurrentRelease();

		// Get the one before that, or default to current
		$key     = array_search($current, $releases);
		$release = array_get($releases, $key + 1, $current);

		return $release;
	}

	/**
	 * Update the current release
	 *
	 * @param  string $release
	 *
	 * @return void
	 */
	public function updateCurrentRelease($release)
	{
		$this->app['rocketeer.deployments']->setValue('current_release', $release);
	}

}