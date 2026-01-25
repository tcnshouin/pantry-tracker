#include <iostream>
#include <iomanip>

using namespace std;

int main() {

    double result, mres, fres, qres, eres;

    cout << "Enter Midterm Grade(0-50): ";
    double m_grade; cin >> m_grade;

while (m_grade < 0 || m_grade > 50) {
    cout << "Invalid input. Enter Midterm Grade: ";
    cin >> m_grade;
}

    cout << "Enter Finals Grade(0-50): ";
    double f_grade; cin >> f_grade;

    while (f_grade < 0 || f_grade > 50) {
        cout << "Invalid input. Enter Finals Grade: ";
        cin >> f_grade;
    }

    cout << "Enter Quizzes Grade(0-30): ";
    double q_grade; cin >> q_grade;

    while (q_grade < 0 || q_grade > 30) {
        cout << "Invalid input. Enter Quizzes Grade: ";
        cin >> q_grade;
    }

    cout << "Enter Exercises Grade(0-20): ";
    double e_grade; cin >> e_grade;

    while (e_grade < 0 || e_grade > 20) {
        cout << "Invalid input. Enter Exercises Grade: ";
        cin >> e_grade;
    }

    mres = m_grade / 50;
    fres = f_grade / 50;
    qres = q_grade / 30;
    eres = e_grade / 20;

    result = (m_grade + f_grade + q_grade + e_grade) / 150;
    result *= 100;

    if (100 => result <= 97) {
        cout << "Your grade total of " << result << "is equivalent to 4.00"<< endl;
    }
    else if(96.99 => result <= 94) {
        cout << "Your grade total of " << result << "is equivalent to 3.75"<< endl;
    }
    else if(93.99 => result <= 90) {
        cout << "Your grade total of " << result << "is equivalent to 3.50"<< endl;
    }
    else if(89.99 => result <= 86) {
        cout << "Your grade total of " << result << "is equivalent to 3.00"<< endl;
    }
    else if(85.99 => result <= 83) {
        cout << "Your grade total of " << result << "is equivalent to 2.75"<< endl;
    }
    else if(82.99 => result <= 80) {
        cout << "Your grade total of " << result << "is equivalent to 2.50"<< endl;
    }
    else if(79.99 => result <= 77) {
        cout << "Your grade total of " << result << "is equivalent to 2.25"<< endl;
    }
    else if (75.99 => result >= 75) {
        cout << "Your grade total of " << result << "is equivalent to 2.00"<< endl;
    }
    else if(result < 75) {
        cout << "Your grade total of " << result << "is equivalent to 0.00"<< endl;
    }

    return 0;
}
