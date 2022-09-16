<?php

namespace PrixChat\Controllers;

use PrixChat\Broadcast_Service;

class SSE_Controller extends Base_Controller {
    public function get_items( $request ) {
        $broadcast_service = new Broadcast_Service();

        $broadcast_service->request = $request;
        $broadcast_service->start();
    }
}