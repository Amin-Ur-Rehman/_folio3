<?php
namespace SystemWrapper\Netsuite;

/**
 * Created by PhpStorm.
 * User: ubaig
 * Date: 4/25/14
 * Time: 2:24 PM
 */

class NsRestRequest
{

    protected $url;
    protected $verb;
    protected $request;
    protected $response;
    protected $headers;

    public function __construct($url = null, $verb = 'GET', $data = null)
    {
        $this->verb = $verb;
        $this->request = $data;
        $this->url = $url;
        $this->response = null;
        $this->headers = array();

        if ($this->request !== null) {
            $this->buildPostBody();
        }
    }

    public function buildPostBody($data = null)
    {
        $data = ($data !== null) ? $data : $this->request;

        if (!is_object($data) && !is_array($data)) {
            throw new \Exception('Invalid data input for postBody [' . gettype($data) . ']');
        }
        $data = json_encode($data);
        $this->request = $data;
    }

    public function setNsHeaders($auth_account, $email, $password, $role)
    {
//        $this->headers = array(
//            'Content-Type: application/json',
//            'Authorization: NLAuth nlauth_account=3500213,nlauth_email=ubaig@folio3.com,nlauth_signature=click123,nlauth_role=3');
//        'Authorization: NLAuth nlauth_account=TSTDRV1146824, nlauth_email=' . $email . ', nlauth_signature=' . $password . ', nlauth_role=3',

//      Hardcoded value replaced with parameter variables
        $this->headers = array(
            'Content-Type: application/json',
            'Authorization: NLAuth nlauth_account=' . $auth_account . ', nlauth_email=' . urlencode($email) . ', nlauth_signature=' . urlencode($password) . ', nlauth_role=' . $role,
        );
    }

    public function setNsLoginHeaders($auth_account, $email, $password)
    {
        $this->headers = array(
            'Authorization: NLAuth nlauth_account=' . $auth_account . ', nlauth_email=' . urlencode($email) . ', nlauth_signature=' . urlencode($password)
        , 'Content-Type: application/json'
        );
    }

    /**
     * This function adds custom header in headers array
     * @param type $customHeader
     */
    public function setCustomHeaders($customHeader)
    {
        array_push($this->headers, $customHeader);
    }

    public function execute()
    {
//      $this->setNsHeaders();
        $ch = curl_init();

        try {
            switch (strtoupper($this->verb)) {
                case 'GET':
                    $this->executeGet($ch);
                    break;
                case 'POST':
                    $this->executePost($ch);
                    break;
                default:
                    throw new \InvalidArgumentException('"' . $this->verb . '" is an invalid REST verb.');
            }
            curl_close($ch);
        } catch (\Exception $e) {
            curl_close($ch);
            throw $e;
        }
        return $this->response['body'];
    }

    protected function executeGet($ch)
    {
        $this->doExecute($ch);
    }

    protected function executePost($ch)
    {
        $this->doExecutePost($ch);
    }

    protected function doExecute(&$ch)
    {
        set_time_limit(300);
        curl_setopt($ch, CURLOPT_TIMEOUT, 0);
        curl_setopt($ch, CURLOPT_URL, $this->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        $this->response['body'] = curl_exec($ch);
        $this->response['info'] = curl_getinfo($ch);
        if ($this->response['body'] == false) {
            throw new \Exception(curl_error($ch));
        }
    }

    protected function doExecutePost(&$ch)
    {
        set_time_limit(300);
        curl_setopt($ch, CURLOPT_TIMEOUT, 0);
        curl_setopt($ch, CURLOPT_URL, $this->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $this->request);

        $this->response['body'] = curl_exec($ch);
        $this->response['info'] = curl_getinfo($ch);

        if ($this->response['body'] == false) {
            throw new \Exception(curl_error($ch));
        }
    }

}
