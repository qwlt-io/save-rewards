export const SESSION = {
    SESSION_STARTED: "SESSION_STARTED",
    SESSION_IN_PROGRESS: "SESSION_IN_PROGRESS",
    SESSION_STOPPED: "SESSION_STOPPED"
}

export const MESSAGES = {
    SUCCESS: "success",
    FAILED: "failed"
}

export const METRIC_TYPE = {
    STEP_COUNT: 'STEP_COUNT',
    GPS: 'GPS',
    SCREEN_TIME: 'SCREEN_TIME'
}

export const COIN_TYPE = {
    QWLT: 'QWLT',
    SILK : 'SILK'
}

export const REWARD_TYPE = {
    EARNED : 'EARNED',
    SPENT : 'SPENT'
}

export const CASSANDRA_TABLES = {
    WALLET_TRANSACTION: 'WALLET_TRANSACTION',
    USER_APP_OPENINGS: 'USER_APP_OPENINGS'
}

export const QUERY = {
    INSERT_FOR_SCREEN_TIME: 'INSERT INTO qwlt_screen_time_metric("id","userId","startScreenTime","endScreenTime","createdAt","updatedAt") VALUES(?, ?, ?, ?, ?, ?)',
    INSERT_FOR_STEP_COUNT: 'INSERT INTO qwlt_step_count_metric("id", "userId", "stepCount", "createdAt", "updatedAt") VALUES (?,?, ?, ?, ?)',
    INSERT_FOR_GPS: 'INSERT INTO qwlt_gps_metric("id", "userId", "lat", "long", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)',
    INSERT_FOR_WALLET_TRANSACTION: 'INSERT INTO qwlt_wallet_transactions("id","userId","walletId","txnType","rewardPoints","coinType","rewardTypeId","createdAt","updatedAt") VALUES(?,?,?,?,?,?,?,?,?)',
    GET_USER_APP_OPENINGS: 'SELECT * from qwlt_user_app_openings where user_id = ? and opening_date = ?',
    INSERT_USER_APP_OPENINGS: 'INSERT INTO qwlt_user_app_openings("user_id","opening_date", "opening_time") VALUES(?,?,?)'
}