#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "***********************************************************************" << endl;
    cout << "*****    Options: Junior[1], Sophmore[2], Junior[3], Senior[4]    *****" << endl;
    cout << "***********************************************************************" << endl;
    repeat:
    cout << "Enter your Level: ";
    int lvl; cin >> lvl;

    switch (lvl) {
        case 1: cout << endl << "Level: Freshmen" << endl;
            cout << "Subjects: Proglad, Calculus, Chemistry"<< endl; break;

            case 2: cout << endl << "Level: Sophmore" << endl;
            cout << "Subjects: DataStru, Netwkl, Funelecs"<< endl; break;

            case 3: cout << "Level: Junior" << endl;
            cout << "Subjects: Embesys, Micropro, CPEMetre"<< endl; break;

            case 4: cout << "Level: Senior" << endl;
            cout << "Subjects: Consys, Emertec, FieldTrip"<< endl; break;

        default:  cout << "Please Enter A Valid Level" << endl; goto repeat;
    }
    return 0;
}
