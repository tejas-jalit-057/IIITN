<?php
/**
 * SAST – Analytics Data API
 * GET /php/api.php?section=<name>
 * Sections: overview | traffic | security | connectivity | bots | tools
 *
 * In production, replace the inline arrays with real DB queries via getDB().
 * The data here is deterministic-ish so charts look realistic.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$section = $_GET['section'] ?? '';

echo json_encode(match($section) {
    'overview'     => overviewData(),
    'traffic'      => trafficData(),
    'security'     => securityData(),
    'connectivity' => connectivityData(),
    'bots'         => botData(),
    'tools'        => toolsData(),
    default        => (function(){ http_response_code(400); return ['error'=>'Unknown section']; })(),
});

// ═══════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════
function overviewData(): array {
    $labels = []; $rps = [];
    for ($i = 0; $i < 288; $i++) {          // 288 × 5 min = 24 h
        $h = intdiv($i, 12);
        $m = ($i % 12) * 5;
        $labels[] = sprintf('%02d:%02d', $h, $m);

        // Realistic daily curve
        $base = match(true) {
            $h >= 8  && $h <= 11 => 650 + ($h-8)*80,
            $h >= 12 && $h <= 13 => 480,
            $h >= 14 && $h <= 17 => 700 + ($h-14)*60,
            $h >= 18 && $h <= 21 => 380 - ($h-18)*55,
            default              => 70 + ($m % 30),
        };
        $rps[] = $base + rand(-25, 50);
    }

    $totalReq = array_sum(array_map(fn($r) => $r * 5, $rps));
    return [
        'metrics' => [
            'total_requests' => $totalReq,
            'peak_rps'       => max($rps),
            'avg_rps'        => round(array_sum($rps) / count($rps), 1),
            'active_bots'    => 14,
            'duration_hours' => 24,
            'success_rate'   => 97.4,
            'failures'       => (int)($totalReq * 0.026),
        ],
        'http_methods' => [
            'GET'    => (int)($totalReq * 0.72),
            'POST'   => (int)($totalReq * 0.18),
            'PUT'    => (int)($totalReq * 0.05),
            'DELETE' => (int)($totalReq * 0.03),
            'PATCH'  => (int)($totalReq * 0.02),
        ],
        'rps_timeline' => ['labels' => $labels, 'rps' => $rps],
    ];
}

// ═══════════════════════════════════════════════════════════════
// TRAFFIC
// ═══════════════════════════════════════════════════════════════
function trafficData(): array {
    $days = []; $volume = [];
    for ($d = 6; $d >= 0; $d--) {
        $days[]   = date('M d', strtotime("-{$d} days"));
        $volume[] = rand(180000, 320000);
    }
    return [
        'volume_7d' => ['labels' => $days, 'data' => $volume],
        'devices'   => ['labels' => ['Mobile','Desktop','Tablet'], 'data' => [42, 51, 7]],
        'browsers'  => ['labels' => ['Chrome','Safari','Firefox','Edge','Opera','Other'], 'data' => [52.1,21.3,12.0,8.5,3.2,2.9]],
        'protocols' => ['labels' => ['HTTP','HTTPS','HTTP/2','HTTP/3'], 'data' => [4.4,56.2,26.2,13.1]],
        'mobile_os' => ['labels' => ['iOS','Android','Win Mobile','Other'], 'data' => [38.1,54.3,4.2,3.4]],
    ];
}

// ═══════════════════════════════════════════════════════════════
// SECURITY
// ═══════════════════════════════════════════════════════════════
function securityData(): array {
    $labels = []; $app = []; $net = [];
    for ($i = 0; $i < 24; $i++) {
        $labels[] = sprintf('%02d:00', $i);
        // Spikes at 02, 09, 15
        [$ab, $nb] = match($i) { 2=>[320,180], 9=>[210,90], 15=>[280,150], default=>[40,25] };
        $app[] = $ab + rand(-10, 25);
        $net[] = $nb + rand(-8, 20);
    }
    $tApp = array_sum($app); $tNet = array_sum($net);
    return [
        'app_layer' => [
            'change_pct' => -12.4, 'total_24h' => $tApp,
            'timeline'   => ['labels' => $labels, 'data' => $app],
            'types'      => [
                ['type'=>'SQL Injection',  'count'=>(int)($tApp*.32)],
                ['type'=>'XSS',            'count'=>(int)($tApp*.24)],
                ['type'=>'CSRF',           'count'=>(int)($tApp*.18)],
                ['type'=>'Path Traversal', 'count'=>(int)($tApp*.14)],
                ['type'=>'Other',          'count'=>(int)($tApp*.12)],
            ],
        ],
        'net_layer' => [
            'change_pct' => 8.7, 'total_24h' => $tNet,
            'timeline'   => ['labels' => $labels, 'data' => $net],
            'types'      => [
                ['type'=>'DDoS (Volumetric)', 'count'=>(int)($tNet*.41)],
                ['type'=>'SYN Flood',         'count'=>(int)($tNet*.28)],
                ['type'=>'UDP Flood',         'count'=>(int)($tNet*.18)],
                ['type'=>'IP Spoofing',       'count'=>(int)($tNet*.13)],
            ],
        ],
    ];
}

// ═══════════════════════════════════════════════════════════════
// CONNECTIVITY
// ═══════════════════════════════════════════════════════════════
function connectivityData(): array {
    $labels=[]; $dl=[]; $ul=[]; $lat=[]; $iqi=[];
    for ($i = 0; $i < 12; $i++) {
        $labels[] = sprintf('%02d:00', 6+$i);
        $d = 110 + rand(20,80) + ($i<4?20:($i<8?40:10));
        $dl[]  = round($d + sin($i)*15, 1);
        $ul[]  = round($d*0.34 + rand(-5,5), 1);
        $lat[] = 12 + rand(0,20);
        $iqi[] = round(60 + $d/2.2, 1);
    }
    return [
        'current'  => ['iqi'=>end($iqi), 'download'=>end($dl), 'upload'=>end($ul), 'latency'=>end($lat)],
        'timeline' => ['labels'=>$labels, 'download'=>$dl, 'upload'=>$ul, 'latency'=>$lat, 'iqi'=>$iqi],
    ];
}

// ═══════════════════════════════════════════════════════════════
// BOTS
// ═══════════════════════════════════════════════════════════════
function botData(): array {
    return [
        'bots' => [
            ['name'=>'Googlebot',           'requests'=>18200, 'ai'=>false],
            ['name'=>'GPT-4o / OpenAI',     'requests'=>9400,  'ai'=>true],
            ['name'=>'ChatGPT-User',        'requests'=>7600,  'ai'=>true],
            ['name'=>'Bingbot',             'requests'=>5300,  'ai'=>false],
            ['name'=>'Claude / Anthropic',  'requests'=>4500,  'ai'=>true],
            ['name'=>'Perplexity AI',       'requests'=>3900,  'ai'=>true],
            ['name'=>'Gemini / Google',     'requests'=>3100,  'ai'=>true],
            ['name'=>'Yandex',              'requests'=>2200,  'ai'=>false],
            ['name'=>'Baidu',               'requests'=>1800,  'ai'=>false],
            ['name'=>'DuckDuckBot',         'requests'=>1600,  'ai'=>false],
        ],
        'robots_txt_agents' => ['GPT-4o / OpenAI','ChatGPT-User','Claude / Anthropic','Perplexity AI','Gemini / Google'],
    ];
}

// ═══════════════════════════════════════════════════════════════
// TOOLS – explorer rows + reports
// ═══════════════════════════════════════════════════════════════
function toolsData(): array {
    $methods=['GET','POST','PUT','DELETE','PATCH'];
    $regions=['US-East','US-West','EU-West','Asia-Pacific','South America'];
    $protos =['HTTPS','HTTP/2','HTTP/3','HTTP'];
    $devices=['Desktop','Mobile','Tablet'];
    $rows = [];
    for ($i = 0; $i < 50; $i++) {
        $rows[] = [
            'id'       => $i+1,
            'time'     => '2026-02-01 ' . sprintf('%02d:%02d:%02d', rand(0,23), rand(0,59), rand(0,59)),
            'method'   => $methods[rand(0,4)],
            'status'   => rand(0,100)<97 ? 200 : (rand(0,1)?404:500),
            'protocol' => $protos[rand(0,3)],
            'device'   => $devices[rand(0,2)],
            'region'   => $regions[rand(0,4)],
            'latency'  => rand(8,320).' ms',
        ];
    }
    return [
        'explorer' => $rows,
        'reports'  => [
            ['id'=>1,'title'=>'January 2026 Monthly Report',  'type'=>'monthly',   'date'=>'2026-01-31','size'=>'2.4 MB'],
            ['id'=>2,'title'=>'December 2025 Monthly Report', 'type'=>'monthly',   'date'=>'2025-12-31','size'=>'2.1 MB'],
            ['id'=>3,'title'=>'Q4 2025 Quarterly Report',     'type'=>'quarterly', 'date'=>'2025-12-31','size'=>'5.8 MB'],
            ['id'=>4,'title'=>'2025 Annual Report',           'type'=>'yearly',    'date'=>'2025-12-31','size'=>'12.3 MB'],
            ['id'=>5,'title'=>'November 2025 Monthly Report', 'type'=>'monthly',   'date'=>'2025-11-30','size'=>'1.9 MB'],
        ],
    ];
}
?>
