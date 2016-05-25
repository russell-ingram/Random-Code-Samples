<!-- A PHP Script I wrote for uploading videos to YouTube and their Content ID API. Someone else wrote the video encoding/decoding, but I wrote the server that handled the API and everything surrounding that. -->
<?php

/**
 * @uri /upload
 *
 *
 */

use Tonic\Response;
require_once 'vendor/autoload.php';
require_once 'vendor/google/apiclient/src/Google/Service/YouTubePartner.php';




class YouTubePostResource extends ResourceBase {

    /**
     * @method POST
     * @json
     */

    function post() {

        define('ENCRYPTION_KEY', 'insertkey');

        // Encrypt email function
        function mc_encrypt($encrypt, $key){
            $encoded = base64_encode(base64_encode($encrypt).'|'.base64_encode($key));
            return $encoded;
        }

        $application_name = 'your_app_name';
        $client_secret = 'you_secret';
        $client_id = 'your_id';

        $data = json_decode($this->request->data);

        $fileData = $data->fileData;
        $userData = $data->userAuth;
        $metadata = $data->metadata->YouTube;
        $key = $userData;
        $uploadType = $fileData->uploadType;
        $contentData = $data->metadata->ContentID;

        $data_to_encrypt = $key->username;
        $encrypted_data = mc_encrypt($data_to_encrypt, ENCRYPTION_KEY);


        // RECONSTRUCTOR FUNCTION

        $btbData = $fileData->btbData;
        $filename = $fileData->filename;
        $user = '';
        try {
            $returnData = new stdClass();
            $returnData->id = 1;
            $returnData->user = $user;
            $jobid = addReconstructionJobNoShell($btbData, $filename);
            $response = new Response($this->request);

            $response->code = Response::OK;
            $response->contentType = "application/json";


            $snippetArray = array('id' => $jobid,
                'title' => $user, 'assetId' => '', 'assetLink' => '', 'youtubeLink' => '');

            $response->body = json_encode($snippetArray);
        } catch (PDOException $ex) {

            $ex->getMessage();
        }
        $time = time();
        $duration = 1;
        $dur_exists = property_exists($fileData, 'duration');
        if ($dur_exists) {
            $duration = $fileData->duration;
        }

        // Removed some metrics



        // YOUTUBE UPLOAD

        if ($uploadType == "youtube") {
            $scope = array('https://www.googleapis.com/auth/youtube.upload');
        }
        else if ($uploadType == "both"){
            $scope = array('https://www.googleapis.com/auth/youtubepartner','https://www.googleapis.com/auth/youtube.upload');
        }
        else {
            $scope = array('https://www.googleapis.com/auth/youtubepartner');
        }



        // removed private $videoPath code, insert here

        if ($uploadType !== "contentid") {
            $videoTitle = $metadata->title;
            $videoDescription = $metadata->description;

        }


        try{
            // Client init
            $client = new Google_Client();
            $client->setApplicationName($application_name);
            $client->setClientId($client_id);
            $client->setAccessType('offline');
            $client->setScopes($scope);
            $client->setClientSecret($client_secret);
            $refreshToken = $key->refresh_token;
            $client->refreshToken($refreshToken);
            $youtube = new Google_Service_YouTube($client);




            if ($client->getAccessToken()) {




                // retrieve content owner's id from currently auth'd user's account

                if ($uploadType !== "youtube") {
                    $youtubePartner = new Google_Service_YouTubePartner($client);

                    $contentOwnersListResponse = $youtubePartner->contentOwners->listContentOwners(array('fetchMine' => true));
                    $contentOwnerId = $contentOwnersListResponse['items'][0]['id'];

                    $listResponse = $youtube->channels->listChannels("snippet", array('onBehalfOfContentOwner' => $contentOwnerId,
                        'managedByMe' => true, 'maxResults' => 50));
                    $channels = '';
                    $channelsArray = array();
                    while (!empty($listResponse['items'])) {
                      foreach ($listResponse['items'] as $listResult) {
                            $channelsArray[] = $listResult['id'];
                            $channels .= sprintf('<li>%s (%s)</li>', $listResult['snippet']['title'],
                            $listResult['id']);
                      }

                      // If the API response returns a pageToken, use that value to request the
                      // next set of results.
                      $pageToken = $listResponse['pageToken'];
                      if(is_null($pageToken))
                        break;
                      $listResponse = $youtube->channels->listChannels("snippet", array('onBehalfOfContentOwner' => $contentOwnerId,
                          'managedByMe' => true, 'maxResults' => 50, 'pageToken' => $pageToken));
                    }



                    $channelId = $channelsArray[0];
                }



                // Create a snipet with title, description, tags and category id
                $snippet = new Google_Service_YouTube_VideoSnippet();
                $snippet->setTitle($videoTitle);
                $snippet->setDescription($videoDescription);

                $snippet->setCategoryId($videoCategory);

                // Create a video status with privacy status. Options are "public", "private" and "unlisted".
                $status = new Google_Service_YouTube_VideoStatus();
                $status->setPrivacyStatus($metadata->categoryId);

                // Create a YouTube video with snippet and status
                $video = new Google_Service_YouTube_Video();
                $video->setSnippet($snippet);
                $video->setStatus($status);

                // Size of each chunk of data in bytes. Setting it higher leads faster upload (less chunks,
                // for reliable connections). Setting it lower leads better recovery (fine-grained chunks)
                $chunkSizeBytes = 1 * 1024 * 1024;

                // Setting the defer flag to true tells the client to return a request which can be called
                // with ->execute(); instead of making the API call immediately.
                $client->setDefer(true);
                // $channelId = "UC1lj2xcrGweN0djt2mPouvw";
                // Create a request for the API's videos.insert method to create and upload the video.
                if ($uploadType !== "contentid") {


                    $insertRequest = $youtube->videos->insert("status,snippet", $video
                        // ,array('onBehalfOfContentOwner' => $contentOwnerId
                        // ,'onBehalfOfContentOwnerChannel' => $channelId)
                    );

                    // Create a MediaFileUpload object for resumable uploads.
                    $media = new Google_Http_MediaFileUpload(
                        $client,
                        $insertRequest,
                        'video/*',
                        null,
                        true,
                        $chunkSizeBytes
                    );
                    $media->setFileSize(filesize($videoPath));
                    // Read the media file and upload it chunk by chunk.
                    $status = false;
                    $handle = fopen($videoPath, "rb");
                    while (!$status && !feof($handle)) {
                        $chunk = fread($handle, $chunkSizeBytes);
                        $status = $media->nextChunk($chunk);
                    }

                    fclose($handle);
                }








                /**
                 * Video has successfully been upload, now lets perform some cleanup functions for this video
                 */
                if ($status->status['uploadStatus'] == 'uploaded') {
                    // Actions to perform for a successful upload
                    $videoId = $status['id'];

                    // var_dump($status['contentDetails']);


                    $snippetArray['youtubeLink'] = 'https://www.youtube.com/watch?v='.$videoId;
                    $response->body = json_encode($snippetArray);


                }

                // If you want to make other calls after the file upload, set setDefer back to false
                if ($uploadType !== "youtube") {
                    $client->setDefer(false);

                    $videoId = $status['id'];

                    // Create an asset resource and set its metadata and type. Assets support
                    // many metadata fields, but this sample only sets a title and description.
                    $asset = new Google_Service_YouTubePartner_Asset();
                    $metadata2 = new Google_Service_YouTubePartner_Metadata();
                    $metadata2->setTitle($contentData->title);
                    $metadata2->setDescription($contentData->description);
                    $metadata2->setCustomId($contentData->customId);
                    $assetType = $contentData->titleProvider;
                    if ($assetType == "episode") {
                        $metadata2->setOriginalReleaseMedium("web");
                        $releaseDate = new Google_Service_YouTubePartner_Date();
                        $currentDate = getdate();
                        $releaseDate->setDay($currentDate['mday']);
                        $releaseDate->setMonth($currentDate['mon']);
                        $releaseDate->setYear($currentDate['year']);
                        $metadata2->setReleaseDate($releaseDate);
                        $metadata2->setShowCustomId("testshowcustomId");
                        $metadata2->setEpisodeNumber("1");

                    } else if ($assetType == "movie") {
                        $metadata2->setOriginalReleaseMedium("web");
                        $releaseDate = new Google_Service_YouTubePartner_Date();
                        $currentDate = getdate();
                        $releaseDate->setDay($currentDate['mday']);
                        $releaseDate->setMonth($currentDate['mon']);
                        $releaseDate->setYear($currentDate['year']);
                        $metadata2->setReleaseDate($releaseDate);


                    }
                    $asset->setMetadata($metadata2);
                    $asset->setStatus("active");
                    $asset->setType($assetType);



                    // Insert the asset resource. Extract its unique asset ID from the API response.
                    $assetInsertResponse = $youtubePartner->assets->insert($asset,array('onBehalfOfContentOwner' => $contentOwnerId));
                    var_dump($assetInsertResponse);
                    $assetId = $assetInsertResponse['id'];
                    $assetLink = 'https://www.youtube.com/content_id?o='.$contentOwnerId.'#asset/d/a='.$assetId.'&x=s&si=1';
                    $snippetArray = array('id' => $jobid,
                        'title' => $user, 'assetId' => $assetId, 'assetLink' => $assetLink);
                    if ($videoId) {
                        $snippetArray['youtubeLink'] = 'https://www.youtube.com/watch?v='.$videoId;
                    }


                    $response->body = json_encode($snippetArray);


                    // Create a territory owner with owner, ratio, type and territories. Set the asset's ownership data. This example identifies the content owner associated with the authenticated user's account as the asset's owner. It indicates that the content owner owns 100% of the asset worldwide.
                    $owners = new Google_Service_YouTubePartner_TerritoryOwners();
                    $owners->setOwner($contentOwnerId);
                    $owners->setRatio(100);

                    $own_exists = property_exists($contentData, 'ownership');


                    if ($own_exists) {
                        $own_str = $contentData->ownership;
                        $own_arr = explode('|-', $own_str);
                        if (sizeof($own_arr) > 1) {
                            $owners->setType("exclude");
                            $territories = explode(' ', $own_arr[1]);
                            $owners->setTerritories($territories);
                        } else if ($own_arr[0] == "WW"){
                            $owners->setType("exclude");
                            $owners->setTerritories(array());
                        } else {
                            $owners->setType("include");
                            $territories = explode(' ', $own_arr[0]);
                            var_dump($territories);
                            $owners->setTerritories($territories);
                        }

                    } else {
                        $owners->setTerritories(array());
                    }



                    // Create ownership with a territory owner
                    $ownership = new Google_Service_YouTubePartner_RightsOwnership();
                    $ownership->setGeneral(array($owners));

                    // Update the asset's ownership with the rights data defined above.
                    $ownershipUpdateResponse = $youtubePartner->ownership->update($assetId, $ownership,array('onBehalfOfContentOwner' => $contentOwnerId));







                    // Create a claim resource. Identify the video being claimed, the asset
                    // that represents the claimed content, the type of content being claimed,
                    // and the policy that you want to apply to the claimed video.
                    // $claim = new Google_Service_YouTubePartner_Claim();
                    // $claim->setAssetId($assetId);
                    // $claim->setVideoId($videoId);
                    // $claim->setPolicy($policy);
                    // $claim->setContentType("audiovisual");

                    // Insert the created claim.
                    // $claimInsertResponse = $youtubePartner->claims->insert($claim,array('onBehalfOfContentOwner' => $contentOwnerId));

                    # Enable ads for the video. This example enables the TrueView ad format.
                    // $option = new Google_Service_YouTubePartner_VideoAdvertisingOption();
                    // $option->setAdFormats(array("trueview_instream"));
                    // $setAdvertisingResponse = $youtubePartner->videoAdvertisingOptions->update(
                    //     $videoId, $option, array('onBehalfOfContentOwner' => $contentOwnerId));


                    // necessary for creating a reference

    $requiredTerritories = new Google_Service_YouTubePartner_TerritoryCondition();
    $requiredTerritories->setTerritories(array());
    $requiredTerritories->setType("exclude");

    // Create a "track" policy for the asset. The policy specifies the
    // conditions when the policy will be applied by defining a duration,
    // territories where the policy applies, and the type of content that an
    // uploaded video must match.
    $everywherePolicyCondition = new Google_Service_YouTubePartner_Conditions();
    $everywherePolicyCondition->setContentMatchType(array("video"));
    $everywherePolicyCondition->setRequiredTerritories($requiredTerritories);
    $everywherePolicyCondition->setReferenceDuration(array("low" => 10));

    // Create a policy rule and associate the conditions with the rule.
    $trackEverywhereRule = new Google_Service_YouTubePartner_PolicyRule();
    $policySetting = "track";
    $ps_exists = property_exists($contentData, 'policySettings');

    $assetMatchPolicy = new Google_Service_YouTubePartner_AssetMatchPolicy();

    if ($ps_exists) {
        $policySetting = $contentData->policySettings;
        if ($policySetting == "Block in all countries") {
            $trackEverywhereRule->setAction("block");
            $assetMatchPolicy->setRules(array($trackEverywhereRule));
        }
        else if ($policySetting == "Monetize in all countries") {
            $trackEverywhereRule->setAction("monetize");
            $assetMatchPolicy->setRules(array($trackEverywhereRule));
        }
        else {
            $assetMatchPolicy->setPolicyId($policySetting);
        }
    } else {
        $trackEverywhereRule->setAction("track");
        $assetMatchPolicy->setRules(array($trackEverywhereRule));
    }

    $trackEverywhereRule->setConditions($everywherePolicyCondition);


    // Update the asset's match policy
    $youtubePartner->assetMatchPolicy->update($assetId, $assetMatchPolicy,
        array('onBehalfOfContentOwner' => $contentOwnerId));









                    $client->setDefer(true);

                    $reference = new Google_Service_YouTubePartner_Reference();
                    $reference->setAssetId($assetId);
                    $reference->setContentType("video");

                    $insertRequest = $youtubePartner->references->insert($reference,
                        array('onBehalfOfContentOwner' => $contentOwnerId));

                    $media = new Google_Http_MediaFileUpload(
                        $client,
                        $insertRequest,
                        'video/*',
                        null,
                        true,
                        $chunkSizeBytes
                    );
                    $media->setFileSize(filesize($videoPath));


                    // Read the media file and upload it chunk by chunk.
                    $status = false;
                    $handle = fopen($videoPath, "rb");
                    while (!$status && !feof($handle)) {
                      $chunk = fread($handle, $chunkSizeBytes);
                      $status = $media->nextChunk($chunk);
                    }

                    $id_exists = property_exists($status, 'id');
                    if ($id_exists) {
                        $refId = $status['id'];
                        $snippetArray['referenceLink'] = $assetLink.'&t=f&r='.$refId.'&ri=0';
                        $response->body = json_encode($snippetArray);
                    }


                    fclose($handle);

                    $client->setDefer(false);


                }




            } else{
                // @TODO Log error
                echo 'Problems creating the client';
            }

        } catch(Google_Service_Exception $e) {
            print "Caught Google service Exception ".$e->getCode(). " message is ".$e->getMessage();
            print "</br>";
            print "Stack trace is ".$e->getTraceAsString();
            print "</br>";
            print $e;
        }catch (Exception $e) {
            print "Caught service Exception ".$e->getCode(). " message is ".$e->getMessage();
            print "Stack trace is ".$e->getTraceAsString();
        }


        return $response;
    }





}


