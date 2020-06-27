const UserSQL  = {
    register : 'INSERT INTO user (uuid,phone,nickName,password) VALUES(?,?,?,?)',
    check : 'SELECT * FROM user WHERE nickName= ? OR phone= ? limit 1 ',
    checkAccount : 'SELECT * FROM user WHERE (phone= ? AND password= ?) limit 1 ',
    addIdea: 'INSERT INTO idea (name,idea,interpretation,date) VALUES (?,?,?,?)',
    searchIdea : 'SELECT * FROM idea ',
}

module.exports = UserSQL;
