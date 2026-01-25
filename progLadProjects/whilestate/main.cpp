#include <iostream>
using namespace std;

int main() {
    int reversedNum = 0;
    int digit;

    cout << "Enter 1st Number: ";
    int num1; cin >> num1;

    while (num1 != 0) {
        digit = num1 % 10;
        reversedNum = reversedNum * 10 + digit;
        num1 = num1 / 10;
    }

    cout << "Reversed number: "<< reversedNum << endl;




    return 0;
}